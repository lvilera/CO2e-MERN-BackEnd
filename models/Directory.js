const mongoose = require('mongoose');

const DirectorySchema = new mongoose.Schema({
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  industry: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String },
  contractorType: { type: String }, // For Local Contractors category
  
  // Enhanced fields (for compatibility with new system)
  imageUrl: { type: String, default: '' },
  socialType: { type: String, default: '' },
  socialLink: { type: String, default: '' },
  package: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  
  // Submission tracking
  submissionMethod: { type: String, enum: ['form', 'admin'], default: 'form' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
DirectorySchema.index({ industry: 1 });
DirectorySchema.index({ city: 1 });
DirectorySchema.index({ email: 1 });
DirectorySchema.index({ contractorType: 1 });
DirectorySchema.index({ package: 1 });
DirectorySchema.index({ status: 1 });

// Pre-save hook to update the updatedAt field
DirectorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Directory', DirectorySchema); 