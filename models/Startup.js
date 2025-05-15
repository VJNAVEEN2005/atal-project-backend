const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Startup title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Startup description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Ongoing', 'Graduated'],
    trim: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  founded: {
    type: String,
    required: [true, 'Founded year is required'],
    trim: true
  },
  revenue: {
    type: String,
    required: [true, 'Revenue stage is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    trim: true
  },
  jobs: {
    type: String,
    required: [true, 'Number of jobs is required'],
    trim: true
  },
  achievements: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Startup = mongoose.model('Startup', startupSchema);
module.exports = Startup;