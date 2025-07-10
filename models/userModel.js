const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true},
  domain: String,
  name: String,
  admin: Number,
  email: String,
  password: String,
  confirmPassword: String,
  phoneNumber: String,
  organizationName: String,
  organizationSize: String,
  organizationIndustry: String,
  founderName: String,
  founderWhatsApp: String,
  dpiitNumber: String,
  sector: String,
  womenLed: String,
  panNumber: String,
  gstNumber: String,
  address: String,
  cityStatePostal: String,
  productDescription: String,
  businessType: String,
  websiteUrl: String,
  growthPotential: String,
  // Student-specific fields
  dateOfBirth: String,
  fatherName: String,
  motherName: String,
  guardianName: String,
  bloodGroup: String,
  educationLevel: String,
  collegeName: String,
  registrationNumber: String,
  department: String,
  yearOfGraduation: String,
  standard: String,
  schoolName: String,
  // Add this new field for profile photo
  profilePhoto: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;