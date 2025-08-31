const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
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
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  publishedDate: { type: Date, default: Date.now },
  author: { type: String, default: 'Admin' },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
BlogSchema.index({ category: 1 });
BlogSchema.index({ publishedDate: -1 });
BlogSchema.index({ isPublished: 1 });
BlogSchema.index({ tags: 1 });

// Pre-save hook to update the updatedAt field
BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema); 