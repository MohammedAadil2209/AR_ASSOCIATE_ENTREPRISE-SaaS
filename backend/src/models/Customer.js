const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
