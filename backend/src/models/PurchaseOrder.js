const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  vendorName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  expectedDelivery: Date,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['DRAFT', 'OPEN', 'RECEIVED', 'CANCELLED'], default: 'DRAFT' },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
