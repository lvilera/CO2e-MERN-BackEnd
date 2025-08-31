const mongoose = require('mongoose');

const FeaturedListingSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' }, // Optional link when image is clicked
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: String, default: 'admin' },
  originalFileName: { type: String },
  displayOrder: { type: Number, default: 0 }, // For ordering images
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
FeaturedListingSchema.index({ isActive: 1, displayOrder: 1 });
FeaturedListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FeaturedListing', FeaturedListingSchema); 