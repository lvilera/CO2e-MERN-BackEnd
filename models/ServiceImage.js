const mongoose = require('mongoose');

const ServiceImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  uploadedBy: { type: String, default: 'admin' },
  originalFileName: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
ServiceImageSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceImage', ServiceImageSchema); 