const express = require("express");
const router = express.Router();
const PartLog = require("../models/PartLog");
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const logs = await PartLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newLog = new PartLog(req.body);
    await newLog.save();

    if (req.body.productId && req.body.quantity) {
      await Product.findByIdAndUpdate(req.body.productId, {
        $inc: { quantity: -Math.abs(req.body.quantity) },
      });
    }

    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
