const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  totalRows: { type: Number, required: true },
  successfulUploads: { type: Number, required: true },
  failedUploads: { type: Number, required: true },
  uploadedBy: { type: String, default: 'Admin' },
  fileType: { type: String, required: true }, // xlsx, xls, csv, xlsm
  status: { type: String, enum: ['completed', 'failed', 'partial'], default: 'completed' }
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema); 