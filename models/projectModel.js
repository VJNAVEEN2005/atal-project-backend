const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registerNumber: { type: String, required: true },
    userId: { type: String },
    department: String,
    yearOfStudy: String,
    instituteName: String,
    projectType: String,
    otherProjectType: String,
    projectTitle: String,
    labEquipmentUsage: String,
    projectDuration: String,
    projectGuideName: String,
    projectMembers: [
        {
            name: String,
            regNo: String,
            department: String,
            yearOfStudy: String
        }
    ],
    components: [String],
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
