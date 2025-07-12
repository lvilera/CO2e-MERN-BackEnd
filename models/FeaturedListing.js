const mongoose = require('mongoose');

const FeaturedListingSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FeaturedListing', FeaturedListingSchema); 