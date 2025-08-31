const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String, default: 'admin' },
  category: { type: String, default: 'general' },
  description: { type: String },
  isPublic: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
UploadedFileSchema.index({ uploadedBy: 1 });
UploadedFileSchema.index({ category: 1 });
UploadedFileSchema.index({ mimetype: 1 });
UploadedFileSchema.index({ isPublic: 1 });

// Pre-save hook to update the updatedAt field
UploadedFileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema); 