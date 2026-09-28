import mongoose from 'mongoose';

const text = { type: String, required: true, trim: true };
const decimal = { type: Number, required: true, min: 0, validate: Number.isFinite };

const productSchema = new mongoose.Schema({
  // Stable CSV identifier (the conceptual SKU); MongoDB also supplies _id.
  product_id: { ...text, unique: true },
  name: text,
  category: text,
  m5_item_id: { ...text, unique: true },
  m5_dept_id: text,
  m5_cat_id: text,
  unit_cost_inr: decimal,
  selling_price_inr: decimal,
  weight_kg: decimal,
  length_cm: decimal,
  width_cm: decimal,
  height_cm: decimal,
  reorder_point_units: {
    type: Number, required: true, min: 0, validate: Number.isSafeInteger,
  },
});

export default mongoose.model('Product', productSchema);
