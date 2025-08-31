const mongoose = require('mongoose');

const UserDirectorySchema = new mongoose.Schema({
  company: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  industry: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String },
  contractorType: { type: String, required: true }, // For Local Contractors category
  
  // Enhanced fields
  imageUrl: { type: String, default: '' },
  socialType: { type: String, default: '' }, // facebook, instagram, linkedin, etc.
  socialLink: { type: String, default: '' }, // URL to social media profile
  package: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  
  // User submission tracking
  userId: { type: String }, // If user is logged in
  userEmail: { type: String }, // Email of the user who submitted (can differ from listing email)
  submissionMethod: { type: String, enum: ['form', 'api'], default: 'form' },
  
  // Moderation and status
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderationNotes: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isPremiumListing: { type: Boolean, default: false },
  premiumExpiry: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Duplicate email check static method
UserDirectorySchema.statics.checkDuplicate = async function(email) {
  const existing = await this.findOne({ email: email.toLowerCase() });
  return existing;
};

// Index for efficient queries
UserDirectorySchema.index({ email: 1 });
UserDirectorySchema.index({ industry: 1 });
UserDirectorySchema.index({ city: 1 });
UserDirectorySchema.index({ status: 1 });
UserDirectorySchema.index({ contractorType: 1 });
UserDirectorySchema.index({ package: 1 });
UserDirectorySchema.index({ userId: 1 });

module.exports = mongoose.model('UserDirectory', UserDirectorySchema); 