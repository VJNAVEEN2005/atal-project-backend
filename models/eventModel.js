const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  registrationLink: {
    type: String,
    trim: true
  },
  poster: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search
eventSchema.index(
  { 
    title: "text", 
    location: "text", 
    description: "text" 
  },
  { 
    weights: { 
      title: 10, 
      location: 5, 
      description: 1 
    },
    name: "events_text_search" 
  }
);

// Add virtual for formatted date
eventSchema.virtual('dateString').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Enable virtuals in toObject output
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;