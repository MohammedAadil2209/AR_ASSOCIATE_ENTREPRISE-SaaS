const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');

router.get('/', async (req, res) => {
  try {
    const services = await ServiceRequest.find().populate('customerId productId assignedTo').sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const service = new ServiceRequest(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.put('/:id', async (req, res) => {
  try {
    const service = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await ServiceRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job ticket purged' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
