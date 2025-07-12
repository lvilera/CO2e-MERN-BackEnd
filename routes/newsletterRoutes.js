const express = require('express');
const Newsletter = require('../models/Newsletter');
const router = express.Router();

// Subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    // Prevent duplicate emails
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Already subscribed' });
    const subscription = new Newsletter({ email });
    await subscription.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all newsletter emails (admin use)
router.get('/', async (req, res) => {
  try {
    const emails = await Newsletter.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 