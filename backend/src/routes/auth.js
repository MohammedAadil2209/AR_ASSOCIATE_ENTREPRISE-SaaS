const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password }); // In prod use hashing!
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      name: user.name,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
