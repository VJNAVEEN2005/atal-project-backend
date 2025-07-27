const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true,
        lowercase: true
    },
    twitter: {
        type: String,
        trim: true,
        lowercase: true
    },
    linkedin: {
        type: String,
        trim: true,
        lowercase: true
    },
    youtube: {
        type: String,
        trim: true,
        lowercase: true
    },
    map:{
        type: String,
        trim: true
    },
    whatsapp:{
        type: String,
        trim: true,
        lowercase: true
    },
    role :{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;