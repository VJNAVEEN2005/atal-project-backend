const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source name is required'],
    trim: true
  },
  sourceLink: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['News', 'Programs', 'Events', 'Partnerships', 'Success Stories', 'Impact']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  image: {
    data: Buffer,
    contentType: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);