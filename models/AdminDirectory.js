const mongoose = require('mongoose');

const AdminDirectorySchema = new mongoose.Schema({
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  industry: { type: String, required: true },
  city: { type: String, required: false },
  state: { type: String },
  country: { type: String },
  contractorType: { type: String }, // For Local Contractors category
  
  // New fields for enhanced functionality
  imageUrl: { type: String, default: '' },
  socialType: { type: String, default: '' }, // facebook, instagram, linkedin, etc.
  socialLink: { type: String, default: '' }, // URL to social media profile
  package: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  
  // Admin upload tracking
  uploadBatch: { type: String, required: true }, // Unique batch ID for each upload
  originalFileName: { type: String, required: true },
  sheetName: { type: String },
  rowNumber: { type: Number, required: true },
  uploadedBy: { type: String, default: 'admin' },
  
  // Validation and processing
  validationStatus: { type: String, enum: ['pending', 'valid', 'invalid'], default: 'pending' },
  validationErrors: [{ type: String }],
  originalData: { type: mongoose.Schema.Types.Mixed }, // Store original row data for debugging
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
AdminDirectorySchema.index({ uploadBatch: 1, rowNumber: 1 });
AdminDirectorySchema.index({ industry: 1 });
AdminDirectorySchema.index({ city: 1 });
AdminDirectorySchema.index({ email: 1 });
AdminDirectorySchema.index({ contractorType: 1 });
AdminDirectorySchema.index({ package: 1 });

module.exports = mongoose.model('AdminDirectory', AdminDirectorySchema); 