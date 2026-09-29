import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import FulfillmentNode from '../src/models/FulfillmentNode.js';
import Inventory from '../src/models/Inventory.js';

test('read endpoints, filters, and centralized errors', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const base = `http://127.0.0.1:${server.address().port}`;
  // Test fixtures only: database calls are replaced; no records are written.
  const nodes = [{ node_id: 'N01', status: 'ACTIVE' }];
  const inventory = [
    { node_id: 'N01', product_id: 'P01', available_qty: 250 },
    { node_id: 'N01', product_id: 'P02', available_qty: 250 },
    { node_id: 'N02', product_id: 'P01', available_qty: 0 },
  ];
  const nodeFind = t.mock.method(FulfillmentNode, 'find', () => ({
    sort: () => ({ lean: async () => nodes }),
  }));
  const inventoryFind = t.mock.method(Inventory, 'find', (filter) => ({
    sort: () => ({ lean: async () => inventory.filter((row) =>
      Object.entries(filter).every(([key, value]) => row[key] === value)) }),
  }));

  const response = await fetch(`${base}/api/nodes`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: nodes });

  for (const [query, expected] of [
    ['', inventory],
    ['?nodeId=N01', inventory.slice(0, 2)],
    ['?productId=P01', [inventory[0], inventory[2]]],
    ['?nodeId=N01&productId=P01', [inventory[0]]],
    ['?nodeId=%20N01%20&productId=P01', [inventory[0]]],
    ['?nodeId=missing', []],
  ]) {
    const result = await fetch(`${base}/api/inventory${query}`);
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { data: expected });
  }

  const calls = inventoryFind.mock.callCount();
  for (const query of [
    '?nodeId=', '?productId=%20', '?nodeId=N01&nodeId=N02',
    '?productId=P01&productId=P02', '?nodeId[$ne]=N01',
    '?unexpected=x', '?__proto__=x',
  ]) {
    const result = await fetch(`${base}/api/inventory${query}`);
    assert.equal(result.status, 400);
    assert.deepEqual(await result.json(), { error: 'Invalid request' });
  }
  assert.equal(inventoryFind.mock.callCount(), calls);

  t.mock.method(console, 'error', () => {});
  for (const [path, stub] of [['nodes', nodeFind], ['inventory', inventoryFind]]) {
    stub.mock.mockImplementation(() => ({
      sort: () => ({ lean: async () => { throw new Error('private database detail'); } }),
    }));
    const result = await fetch(`${base}/api/${path}`);
    assert.equal(result.status, 500);
    assert.deepEqual(await result.json(), { error: 'Internal server error' });
  }
});
