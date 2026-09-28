import mongoose from 'mongoose';

const text = { type: String, required: true, trim: true };
const integer = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const decimal = { type: Number, required: true, min: 0, validate: Number.isFinite };

const fulfillmentNodeSchema = new mongoose.Schema({
  // Stable CSV code; cluster_id denotes a service cluster, not a customer region.
  node_id: { ...text, unique: true },
  name: text,
  type: { ...text, enum: ['WAREHOUSE', 'MICRO_FC'] },
  status: { ...text, enum: ['ACTIVE', 'STANDBY', 'INACTIVE'] },
  city: text,
  cluster_id: text,
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  storage_capacity_units: integer,
  processing_capacity_units_per_hour: integer,
  operating_hours_per_day: { ...integer, max: 24 },
  operating_cost_inr_per_day: decimal,
  standby_cost_inr_per_day: decimal,
  activation_cost_inr: decimal,
  activation_time_hours: integer,
  max_delivery_radius_km: decimal,
  is_elastic: { type: Boolean, required: true },
});

export default mongoose.model('FulfillmentNode', fulfillmentNodeSchema);
