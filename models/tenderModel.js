const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    title: String,
    date: String,
    organization: String,
    reference: String,
    lastDate: String,
    lastTime: String,
    fileLink: String,
    fileName: String,
},{ timestamps: true })

const tenderModel = mongoose.model('Tender', tenderSchema);

module.exports = tenderModel;