// routes/audits.js
const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const { computeEmissions } = require('../utils/computeEmissions');

// Basic payload sanitizer (allow only known fields)
function pickAuditFields(body) {
  const fields = [
    'lang',
    'orgName', 'siteAddresses', 'reportStart', 'reportEnd',
    'contactName', 'contactEmail', 'contactPhone',
    'fuelFactor', 'fuelVol', 'gridFactor', 'kwh', 'mileage', 'waste', 'employees',
  ];
  const out = {};
  fields.forEach((k) => { if (body[k] !== undefined) out[k] = body[k]; });
  return out;
}

// Create
router.post('/', async (req, res) => {
  try {
    const base = pickAuditFields(req.body);

    // Optional: basic guardrail for dates
    if (base.reportStart && base.reportEnd) {
      const s = new Date(base.reportStart);
      const e = new Date(base.reportEnd);
      if (s.toString() !== 'Invalid Date' && e.toString() !== 'Invalid Date' && e < s) {
        return res.status(400).json({ message: 'reportEnd cannot be earlier than reportStart' });
      }
    }

    const computed = computeEmissions(base);
    const doc = await Audit.create({ ...base, ...computed });
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /api/audits error', err);
    res.status(500).json({ message: 'Failed to create audit' });
  }
});

// List (basic pagination)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const q = {};

    // Optional filters
    if (req.query.lang) q.lang = req.query.lang;
    if (req.query.orgName) q.orgName = new RegExp(req.query.orgName, 'i');

    const [items, total] = await Promise.all([
      Audit.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Audit.countDocuments(q),
    ]);

    res.json({
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    console.error('GET /api/audits error', err);
    res.status(500).json({ message: 'Failed to fetch audits' });
  }
});

// Read
router.get('/:id', async (req, res) => {
  try {
    const doc = await Audit.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Audit not found' });
    res.json(doc);
  } catch (err) {
    console.error('GET /api/audits/:id error', err);
    res.status(500).json({ message: 'Failed to fetch audit' });
  }
});

// Update (recompute always)
router.put('/:id', async (req, res) => {
  try {
    const base = pickAuditFields(req.body);

    if (base.reportStart && base.reportEnd) {
      const s = new Date(base.reportStart);
      const e = new Date(base.reportEnd);
      if (s.toString() !== 'Invalid Date' && e.toString() !== 'Invalid Date' && e < s) {
        return res.status(400).json({ message: 'reportEnd cannot be earlier than reportStart' });
      }
    }

    const computed = computeEmissions(base);
    const doc = await Audit.findByIdAndUpdate(
      req.params.id,
      { $set: { ...base, ...computed } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Audit not found' });
    res.json(doc);
  } catch (err) {
    console.error('PUT /api/audits/:id error', err);
    res.status(500).json({ message: 'Failed to update audit' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Audit.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Audit not found' });
    res.json({ message: 'Audit deleted' });
  } catch (err) {
    console.error('DELETE /api/audits/:id error', err);
    res.status(500).json({ message: 'Failed to delete audit' });
  }
});

module.exports = router;
