const mongoose = require('mongoose');

const DirectoryUploadSchema = new mongoose.Schema({
  // File information
  originalFileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  
  // Upload batch information
  uploadBatch: { type: String, required: true, unique: true },
  
  // Processing results
  totalRows: { type: Number, required: true },
  successfulUploads: { type: Number, default: 0 },
  failedUploads: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'partial', 'failed'], 
    default: 'processing' 
  },
  
  // Error tracking
  errors: [{
    row: Number,
    sheet: String,
    error: String,
    company: String,
    email: String
  }],
  
  // Upload metadata
  uploadedBy: { type: String, default: 'admin' },
  processingTime: { type: Number }, // in milliseconds
  
  // File content preview (first few rows for reference)
  headers: [String],
  sampleRows: [Object],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
DirectoryUploadSchema.index({ uploadDate: -1 });
DirectoryUploadSchema.index({ uploadBatch: 1 });
DirectoryUploadSchema.index({ status: 1 });
DirectoryUploadSchema.index({ uploadedBy: 1 });

// Pre-save hook to update the updatedAt field
DirectoryUploadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DirectoryUpload', DirectoryUploadSchema); 