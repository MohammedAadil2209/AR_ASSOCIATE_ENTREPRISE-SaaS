const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const customers = req.body; 
    if (!Array.isArray(customers)) return res.status(400).json({ message: 'Array expected.' });

    const phones = customers.map(c => c.phone);
    const existing = await Customer.find({ phone: { $in: phones } });
    const existingPhones = existing.map(e => e.phone);

    const toInsert = customers.filter(c => c.name && c.phone && !existingPhones.includes(c.phone));
    
    if (toInsert.length === 0) return res.json({ message: 'No new unique records found.', count: 0 });

    const result = await Customer.insertMany(toInsert);
    res.status(201).json({ message: 'Bulk Import Success', count: result.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
