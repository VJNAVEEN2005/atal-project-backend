const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    trim: true
  },
  event: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
roadmapSchema.index({ year: 1, month: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);