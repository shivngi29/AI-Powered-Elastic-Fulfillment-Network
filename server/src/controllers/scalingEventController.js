import ScalingEvent from '../models/ScalingEvent.js';

export async function getScalingEvents(req, res) {
  const events = await ScalingEvent.find({}).sort({ created_at: -1, _id: -1 }).lean();
  res.json({ data: events });
}
