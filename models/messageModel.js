const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  occupation: { type: String, required: true },
  company: { type: String, required: true },
  message: { type: String, required: true },
  photo: {
    data: Buffer,
    contentType: String
  },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);