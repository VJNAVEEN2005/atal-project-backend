const mongoose = require('mongoose');

const eventRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  eventDate:{
    type: Date,
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount paid cannot be negative'],
    set: function(value) {
      // Convert string to number if needed
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? value : parsed;
      }
      return value;
    }
  },
  dateOfRegistration: {
    type: Date,
    required: [true, 'Date of registration is required'],
    default: Date.now,
    set: function(value) {
      // Handle various date formats
      if (typeof value === 'string') {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? value : parsed;
      }
      return value;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eventRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for better query performance (email+eventName must be unique)
eventRecordSchema.index({ email: 1, eventName: 1, name: 1 }, { unique: true });

const EventRecord = mongoose.model('EventRecord', eventRecordSchema);

module.exports = EventRecord;
