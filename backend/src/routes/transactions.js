const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transactions by type
router.get('/type/:type', async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: req.params.type.toUpperCase() }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    // Auto-generate Transaction ID based on type if missing
    if (!transaction.transactionId) {
       const prefix = transaction.type === 'ORDER' ? 'SO' : transaction.type === 'INVOICE' ? 'INV' : 'PAY';
       const randomDigits = Math.floor(10000 + Math.random() * 90000);
       transaction.transactionId = `${prefix}-${randomDigits}`;
    }
    
    // Auto fill dates and balances
    if (transaction.type === 'INVOICE') {
       transaction.balanceDue = transaction.balanceDue ?? transaction.amount;
       if (!transaction.dueDate) {
          const due = new Date(); due.setDate(due.getDate() + 15);
          transaction.dueDate = due;
       }
    }
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
