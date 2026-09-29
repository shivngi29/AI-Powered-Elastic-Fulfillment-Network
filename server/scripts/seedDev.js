import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import FulfillmentNode from '../src/models/FulfillmentNode.js';
import Inventory from '../src/models/Inventory.js';

async function readDataset(file, Model, keys) {
  const source = await readFile(new URL(`../../data/synthetic/${file}`, import.meta.url), 'utf8');
  // These inspected project CSVs use unquoted fields. Fail closed if that changes.
  if (source.includes('"')) throw new Error(`${file}: quoted CSV fields need parser support before seeding.`);
  const [header, ...lines] = source.replace(/^\uFEFF/, '').trimEnd().split(/\r?\n/);
  const columns = header.split(',');
  const expected = Object.keys(Model.schema.paths).filter((key) => !['_id', '__v'].includes(key));
  if (!isDeepStrictEqual([...columns].sort(), expected.sort())) {
    throw new Error(`${file}: CSV columns do not match the model.`);
  }
  const seen = new Set();
  const rows = [];
  for (const [index, line] of lines.entries()) {
    const values = line.split(',');
    if (values.length !== columns.length || values.some((value) => !value.trim())) {
      throw new Error(`${file}: invalid or empty fields at line ${index + 2}.`);
    }
    const doc = new Model(Object.fromEntries(columns.map((column, i) => [column, values[i]])));
    await doc.validate();
    const row = Object.fromEntries(columns.map((column) => [column, doc.get(column)]));
    const identity = JSON.stringify(keys.map((key) => row[key]));
    if (seen.has(identity)) throw new Error(`${file}: duplicate key ${identity}.`);
    seen.add(identity);
    rows.push(row);
  }
  if (!rows.length) throw new Error(`${file}: no records found.`);
  return { Model, keys, rows, file, pending: [] };
}

async function seed() {
  if (!process.argv.includes('--development') || process.env.NODE_ENV === 'production') {
    throw new Error('Development/demo seeding only. Pass --development and do not use NODE_ENV=production.');
  }
  // Deliberately limited to the local project database, never an Atlas/remote target.
  const uri = process.env.MONGODB_URI;
  let target;
  try { target = new URL(uri); } catch { throw new Error('Set a valid local MONGODB_URI in server/.env.'); }
  if (target.protocol !== 'mongodb:' || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
      || !['/elastic_fulfillment', '/elastic_fulfillment_dev', '/elastic_fulfillment_demo'].includes(target.pathname)
      || target.search) {
    throw new Error('Seed target must be a local elastic_fulfillment, elastic_fulfillment_dev, or elastic_fulfillment_demo database without URI query options.');
  }

  const datasets = await Promise.all([
    readDataset('products.csv', Product, ['product_id']),
    readDataset('fulfillment_nodes.csv', FulfillmentNode, ['node_id']),
    readDataset('inventory.csv', Inventory, ['node_id', 'product_id']),
  ]);
  const [products, nodes, inventory] = datasets;
  const productIds = new Set(products.rows.map((row) => row.product_id));
  const nodeIds = new Set(nodes.rows.map((row) => row.node_id));
  if (new Set(products.rows.map((row) => row.m5_item_id)).size !== products.rows.length) {
    throw new Error('Duplicate m5_item_id in products.csv.');
  }
  for (const row of inventory.rows) {
    if (!productIds.has(row.product_id) || !nodeIds.has(row.node_id)) {
      throw new Error('Inventory references a node or product missing from the CSV datasets.');
    }
  }

  await mongoose.connect(uri, { autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  console.log(`DEVELOPMENT/DEMO seed target: ${mongoose.connection.name}`);
  // Preflight every collection before inserting anything. Existing records are never updated.
  for (const dataset of datasets) {
    const { Model, keys, rows } = dataset;
    const existing = await Model.find({}).lean();
    const identity = (row) => JSON.stringify(keys.map((key) => row[key]));
    const indexed = new Map(existing.map((row) => [identity(row), row]));
    if (indexed.size !== existing.length) throw new Error(`${Model.modelName}: duplicate database keys; seed aborted.`);
    for (const row of rows) {
      const current = indexed.get(identity(row));
      if (current && Object.keys(row).some((key) => !isDeepStrictEqual(current[key], row[key]))) {
        throw new Error(`${Model.modelName} ${identity(row)} differs from the CSV; no overwrite allowed.`);
      }
      if (Model === Product && existing.some((other) => other.m5_item_id === row.m5_item_id && other.product_id !== row.product_id)) {
        throw new Error('Product M5 identifier conflicts with an existing record.');
      }
      if (!current) dataset.pending.push(row);
    }
  }
  for (const { Model, pending, rows } of datasets) {
    await Model.createIndexes();
    // Rows have already passed model validation. Native insertion preserves the
    // CSV version instead of Mongoose insertMany() resetting it to zero.
    if (pending.length) await Model.collection.insertMany(pending);
    // Read back every seeded record and compare all source fields.
    for (const row of rows) {
      const keys = Model === Inventory ? ['node_id', 'product_id'] : [Model === Product ? 'product_id' : 'node_id'];
      const saved = await Model.findOne(Object.fromEntries(keys.map((key) => [key, row[key]]))).lean();
      if (!saved || Object.keys(row).some((key) => !isDeepStrictEqual(saved[key], row[key]))) {
        throw new Error(`${Model.modelName}: read-back verification failed.`);
      }
    }
    console.log(`${Model.modelName}: imported ${pending.length}, unchanged ${rows.length - pending.length}, verified ${rows.length}.`);
  }
}

try {
  await seed();
} catch (error) {
  // Database errors may include credentials or connection details.
  const safe = error.name === 'Error' || error.code === 'ENOENT';
  console.error(`Development seed failed: ${safe ? error.message : 'Database or validation failure. Check CSV values, database availability, and unique indexes.'}`);
  console.error('No existing records were overwritten. If inserts partially completed, rerun after resolving the error.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
