const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  courseName: { type: String, required: true },
  date: { type: Date, required: true },
  start: { type: String, required: true }, // e.g., "09:00"
  end: { type: String, required: true }, // e.g., "17:00"
  city: { type: String, required: true },
  area: { type: String, required: true },
  status: { type: String, enum: ['on-hold', 'confirmed', 'completed', 'cancelled'], default: 'on-hold' },
  
  // Notification tracking
  notifiedInstructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' }],
  
  // Payment information
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentIntentId: { type: String }, // Stripe payment intent ID
  amount: { type: Number }, // Amount in cents
  currency: { type: String, default: 'usd' },
  
  // Additional details
  notes: { type: String },
  duration: { type: Number, default: 8 }, // Duration in hours
  durationWeeks: { type: Number, default: 1 }, // Duration in weeks
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
BookingSchema.index({ user: 1 });
BookingSchema.index({ instructor: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ city: 1, area: 1 });
BookingSchema.index({ paymentStatus: 1 });

// Pre-save hook to update the updatedAt field
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema); 