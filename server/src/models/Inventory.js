import mongoose from 'mongoose';

const quantity = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };

const inventorySchema = new mongoose.Schema({
  // References use the CSV business keys, not MongoDB ObjectIds.
  // A future write/import service must verify that these records exist.
  node_id: { type: String, required: true, trim: true },
  product_id: { type: String, required: true, trim: true },
  // Unreserved on-hand stock; reserved_qty is additional physical stock.
  available_qty: quantity,
  reserved_qty: quantity,
  in_transit_qty: quantity,
  // Target within available stock, not extra stock; may exceed current stock.
  safety_stock: quantity,
  // Preserve the source snapshot time. Future writes must update this explicitly.
  last_updated: { type: Date, required: true },
  version: { ...quantity, default: 0 },
}, {
  versionKey: 'version',
  // Document save() checks/increments version; query updates need explicit handling.
  optimisticConcurrency: true,
});

inventorySchema.index({ node_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model('Inventory', inventorySchema);
