const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team member name is required']
  },
  role: {
    type: String,
    required: [true, 'Team member role is required']
  },
  image: {
    data: Buffer,
    contentType: String
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  linkedin: {
    type: String
  },
  team: {
    type: String,
    enum: ['Core Team', 'Executive Team'],
    default: 'Core Team'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);