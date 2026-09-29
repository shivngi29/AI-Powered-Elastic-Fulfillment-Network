import mongoose from 'mongoose';

const capacity = { type: Number, required: true, min: 0, validate: Number.isFinite };
const optionalCost = { type: Number, default: null, min: 0, validate: (value) => value == null || Number.isFinite(value) };

const scalingEventSchema = new mongoose.Schema({
  action: { type: String, required: true, enum: ['SCALE_OUT', 'SCALE_IN', 'MAINTAIN'] },
  // Business key, not an ObjectId. MAINTAIN may apply to the whole cluster.
  node_id: {
    type: String, trim: true, default: null,
    required() { return this.action !== 'MAINTAIN'; },
  },
  cluster_id: { type: String, required: true, trim: true },
  reason: { type: String, required: true, trim: true },
  predicted_demand_units_per_day: capacity,
  available_capacity_units_per_day: capacity,
  required_capacity_units_per_day: capacity,
  estimated_cost_inr: optionalCost,
  expected_savings_inr: optionalCost,
  status: { type: String, enum: ['RECORDED', 'PENDING', 'EXECUTED', 'FAILED', 'CANCELLED'], default: 'RECORDED', required: true },
  source: { type: String, enum: ['intelligence', 'demo'], required: true },
  created_at: { type: Date, default: Date.now, required: true, immutable: true },
  executed_at: { type: Date, default: null },
});

scalingEventSchema.pre('validate', function () {
  if (this.status === 'EXECUTED' && !this.executed_at) {
    this.invalidate('executed_at', 'Executed events require an execution timestamp.');
  }
  if (this.executed_at && (this.status !== 'EXECUTED' || this.executed_at < this.created_at)) {
    this.invalidate('executed_at', 'Execution time must belong to an executed event and cannot precede creation.');
  }
});
scalingEventSchema.index({ created_at: -1, _id: -1 });

export default mongoose.model('ScalingEvent', scalingEventSchema);
