const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true, default: 'Other' },
  category: { type: String },
  serialNumber: { type: String },
  sku: { type: String },
  barcode: { type: String },
  quantity: { type: Number, default: 0 },
  committedQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ['IN_STOCK', 'SOLD', 'OUT_OF_STOCK', 'COMMITTED'], default: 'IN_STOCK' },
  itemType: { type: String, enum: ['UNIT', 'SPARE'], default: 'UNIT' },
  price: { type: Number, required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  isComposite: { type: Boolean, default: false },
  subItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
