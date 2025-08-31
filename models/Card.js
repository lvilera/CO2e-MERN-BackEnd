const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  titleEn: { type: String, required: true },
  titleFr: { type: String, required: true },
  titleEs: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  descriptionFr: { type: String, required: true },
  descriptionEs: { type: String, required: true },
  imageUrl: { type: String, required: true },
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