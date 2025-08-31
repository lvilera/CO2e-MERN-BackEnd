const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  isActive: { type: Boolean, default: true },
  language: { type: String, enum: ['en', 'fr', 'es'], default: 'en' },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  source: { type: String, default: 'website' }, // where they subscribed from
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });
NewsletterSchema.index({ language: 1 });

// Pre-save hook to update the updatedAt field
NewsletterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Newsletter', NewsletterSchema); 