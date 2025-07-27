const mongoose = require('mongoose');
const internshipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateOfBirth: String,
    //userId: String,
    emailId: String,
    phoneNumber: String,
    fatherName: String,
    motherName: String,
    bloodGroup: String,
    permanentAddress: String,
    communicationAddress: String,
    dateOfExpiry: String,
    maritalStatus: String,
    internNo: {
        type: String,
        required: true,
        unique: true
    },
    dateOfJoining: String,
    designation: String,
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    }
})

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship