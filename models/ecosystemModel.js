const mongoose = require('mongoose');

const ecosystemSchema = new mongoose.Schema({
    registeredMembers: {
        type: Number,
        required: [true, 'Number of registered members is required'],
        default: 0,
    },
    startupsSupported: {
        type: Number,
        required: [true, 'Number of startups supported is required'],
        default: 0,
    },
    mentorsOnBoard: {
        type: Number,
        required: [true, 'Number of mentors on board is required'],
        default: 0,
    },
    industrialPartnerships: {
        type: Number,
        required: [true, 'Number of industrial partnerships is required'],
        default: 0,
    },
    academicPartnerships: {
        type: Number,
        required: [true, 'Number of academic partnerships is required'],
        default: 0,
    },
    industryConsultingProjects: {
        type: Number,
        required: [true, 'Number of industry consulting projects is required'],
        default: 0,
    },
    msmeSupport: {
        type: Number,
        required: [true, 'Number of MSME support initiatives is required'],
        default: 0,
    },
    outreachInitiativesEvents: {
        type: Number,
        required: [true, 'Number of outreach initiatives and events is required'],
        default: 0,
    },
    numberOfStartups: {
        type: Number,
        required: [true, 'Number of startups is required'],
        default: 0,
    },
    startupsGraduated: {
        type: Number,
        required: [true, 'Number of startups graduated is required'],
        default: 0,
    },
    employmentGenerated: {
        type: Number,
        required: [true, 'Number of employment generated is required'],
        default: 0,
    },
    corpsFund : {
        type: Number,
        required: [true, 'Corps fund amount is required'],
        default: 0,
    },
    csrSecured: {
        type: Number,
        required: [true, 'CSR secured amount is required'],
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ecosystem', ecosystemSchema);