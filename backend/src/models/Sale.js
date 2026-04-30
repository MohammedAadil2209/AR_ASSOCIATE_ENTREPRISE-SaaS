const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saleDate: { type: Date, default: Date.now },
  warrantyEndDate: { type: Date },
  amount: { type: Number, required: true },
  invoiceUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
