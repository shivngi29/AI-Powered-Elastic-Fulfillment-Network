import Inventory from '../models/Inventory.js';

export async function getInventory(req, res) {
  const filter = {};
  const fields = { nodeId: 'node_id', productId: 'product_id' };

  for (const [key, value] of Object.entries(req.query)) {
    if (!Object.hasOwn(fields, key) || typeof value !== 'string' || !value.trim()) {
      const error = new Error('Inventory filters must be single, nonempty nodeId or productId values.');
      error.status = 400;
      throw error;
    }
    // Explicit scalar equality only; never pass the raw query to MongoDB.
    filter[fields[key]] = value.trim();
  }

  const inventory = await Inventory.find(filter)
    .sort({ node_id: 1, product_id: 1 })
    .lean();
  res.json({ data: inventory });
}
