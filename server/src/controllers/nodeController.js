import FulfillmentNode from '../models/FulfillmentNode.js';

export async function getNodes(req, res) {
  const nodes = await FulfillmentNode.find({}).sort({ node_id: 1 }).lean();
  res.json({ data: nodes });
}
