const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash this.
  role: { 
    type: String, 
    enum: ['ADMIN', 'SALESMAN', 'TECHNICIAN', 'STAFF'], 
    default: 'STAFF' 
  },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
