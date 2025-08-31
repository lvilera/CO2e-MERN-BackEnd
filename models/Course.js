const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
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
  price: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  duration: { type: Number, required: true }, // Duration in hours
  durationWeeks: { type: Number, default: 1 }, // Duration in weeks
  category: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  maxParticipants: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  enrolledCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
CourseSchema.index({ category: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ instructor: 1 });

// Pre-save hook to update the updatedAt field
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', CourseSchema); 