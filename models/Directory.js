const mongoose = require('mongoose');

const DirectorySchema = new mongoose.Schema({
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  socialType: { type: String }, // new
  socialLink: { type: String }, // new
  industry: { type: String, required: true },
  displayCategory: { type: String, trim: true }, // For frontend category filtering
  description: { type: String, required: false },
  imageUrl: { type: String }, // Only for premium
  package: { type: String }, // pro, premium, or undefined for free
  // Location fields for contractor matching
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  // Local Contractors specific fields
  contractorType: { type: String, trim: true }, // Type of local contractor
  customContractorType: { type: String, trim: true }, // Custom contractor type when "Other" is selected
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Directory', DirectorySchema); 