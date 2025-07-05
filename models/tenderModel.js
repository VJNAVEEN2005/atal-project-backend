const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: String,
    organization: {
        type: String,
        required: true
    },
    reference: String,
    lastDate: {
        type: String,
        required: true
    },
    lastTime: {
        type: String,
        required: true
    },
    fileName: String,
    fileId: mongoose.Schema.Types.ObjectId, // Store GridFS file reference
    fileContentType: {
        type: String,
        default: 'application/pdf'
    }
}, { timestamps: true });

const tenderModel = mongoose.model('Tender', tenderSchema);

module.exports = tenderModel;