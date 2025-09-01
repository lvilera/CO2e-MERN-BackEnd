const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    es: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    es: { type: String, required: true }
  },
  link: { type: String, required: true },
  imageUrl: { type: String, required: false }, // Made optional for now
  originalFileName: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
CardSchema.index({ isActive: 1, displayOrder: 1 });
CardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Card', CardSchema); 