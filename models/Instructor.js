const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Location fields
  city: { type: String },
  location: { type: String }, // This appears to be the area/region
  
  // Availability - Map of day names to array of time slots
  // e.g., { "Monday": [{ start: "09:00", end: "17:00" }], "Tuesday": [...] }
  availability: {
    type: Map,
    of: [{
      start: { type: String },
      end: { type: String }
    }],
    default: new Map()
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  
  // Bookings count for analytics
  totalBookings: { type: Number, default: 0 },
  
  // Profile information
  bio: { type: String },
  specialties: [{ type: String }],
  experience: { type: String },
  hourlyRate: { type: Number },
  
  // Contact preferences
  phoneNumber: { type: String },
  preferredContactMethod: { type: String, enum: ['email', 'phone'], default: 'email' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Index for efficient queries
InstructorSchema.index({ email: 1 });
InstructorSchema.index({ city: 1 });
InstructorSchema.index({ location: 1 });
InstructorSchema.index({ isActive: 1 });

// Pre-save hook to update the updatedAt field
InstructorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Instructor', InstructorSchema); 