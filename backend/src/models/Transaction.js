const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['ORDER', 'INVOICE', 'PAYMENT', 'BILL', 'VENDOR_CREDIT'], required: true },
  category: { type: String, enum: ['SALES', 'PURCHASE'], default: 'SALES' },
  transactionId: { type: String }, 
  date: { type: Date, default: Date.now },
  customerName: { type: String },
  vendorName: { type: String },
  amount: { type: Number, default: 0 },
  description: { type: String },
  
  // Status flags
  status: { type: String, default: 'DRAFT' }, // Unified status field for UI
  
  // Order/Purchase specific
  orderStatus: { type: String, enum: ['DRAFT', 'CONFIRMED', 'CLOSED', 'RECEIVED'], default: 'DRAFT' },
  invoicedStatus: { type: String, default: 'Uninvoiced' },
  
  // Invoice specific
  invoiceStatus: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'], default: 'DRAFT' },
  dueDate: { type: Date },
  balanceDue: { type: Number },
  relatedOrder: { type: String }, 
  
  // Payment specific
  paymentMode: { type: String },
  referenceInfo: { type: String },
  unusedAmount: { type: Number, default: 0 },
  salesmanName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
