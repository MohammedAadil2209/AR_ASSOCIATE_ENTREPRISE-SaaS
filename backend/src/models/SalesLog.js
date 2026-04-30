const mongoose = require('mongoose');

const salesLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  unitName: { type: String, required: true },
  salesPersonName: { type: String, required: true },
  action: { type: String, enum: ['OUT_FOR_DELIVERY', 'SOLD', 'RETURNED'], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  syncedFromMobile: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SalesLog', salesLogSchema);
