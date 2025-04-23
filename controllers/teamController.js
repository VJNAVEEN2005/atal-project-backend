const Team = require('../models/teamModel');
const multer = require('multer');

// Configure multer for memory storage (not disk)
const storage = multer.memoryStorage();

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Export the upload middleware for single image
exports.uploadTeamImage = upload.single('image');

// Create a new team member
exports.createTeamMember = async (req, res) => {
  try {
    const teamData = {
      name: req.body.name,
      role: req.body.role,
      email: req.body.email || '',
      linkedin: req.body.linkedin || '',
      team: req.body.team || 'Core Team'
    };
    
    // If an image was uploaded, add it to MongoDB
    if (req.file) {
      teamData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    // Get the highest order value and add 1
    const lastMember = await Team.findOne({ team: teamData.team }).sort({ order: -1 });
    teamData.order = lastMember ? lastMember.order + 1 : 0;
    
    const newTeamMember = await Team.create(teamData);
    
    // Create a response-friendly version without the large binary data
    const responseTeamMember = newTeamMember.toObject();
    if (responseTeamMember.image && responseTeamMember.image.data) {
      // Replace binary data with a URL to get the image
      responseTeamMember.imageUrl = `/api/team/image/${newTeamMember._id}`;
      delete responseTeamMember.image;
    }
    
    return res.status(201).json({
      success: true,
      message: "Team member added successfully",
      team: responseTeamMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all team members
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find().sort({ order: 1 });
    
    // Create response-friendly versions without the large binary data
    const responseTeamMembers = teamMembers.map(member => {
      const memberObj = member.toObject();
      if (memberObj.image && memberObj.image.data) {
        // Replace binary data with a URL to get the image
        memberObj.image = `/api/team/image/${member._id}`;
      }
      return memberObj;
    });
    
    return res.status(200).json({
      success: true,
      message: "Team members fetched successfully",
      team: responseTeamMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get team member image by ID
exports.getTeamMemberImage = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findById(id);
    
    if (!member || !member.image || !member.image.data) {
      return res.status(404).send('Image not found');
    }
    
    res.set('Content-Type', member.image.contentType);
    return res.send(member.image.data);
  } catch (error) {
    console.error('Error fetching team member image:', error);
    return res.status(500).send('Server error');
  }
};

// Update a team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      name: req.body.name,
      role: req.body.role,
      email: req.body.email || '',
      linkedin: req.body.linkedin || '',
      team: req.body.team || 'Core Team'
    };
    
    // If an image was uploaded, update it
    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    const updatedTeamMember = await Team.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTeamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found"
      });
    }
    
    // Create a response-friendly version without the large binary data
    const responseTeamMember = updatedTeamMember.toObject();
    if (responseTeamMember.image && responseTeamMember.image.data) {
      // Replace binary data with a URL to get the image
      responseTeamMember.image = `/api/team/image/${updatedTeamMember._id}`;
    }
    
    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      team: responseTeamMember
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the team member to delete
    const teamMember = await Team.findById(id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found"
      });
    }
    
    const teamType = teamMember.team;
    const memberOrder = teamMember.order;
    
    // Delete the team member
    await Team.findByIdAndDelete(id);
    
    // Update the order of remaining team members
    await Team.updateMany(
      { team: teamType, order: { $gt: memberOrder } },
      { $inc: { order: -1 } }
    );
    
    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reorder team members
exports.reorderTeamMembers = async (req, res) => {
  try {
    const { teamMembers } = req.body;
    
    // Update each team member with its new order
    const updatePromises = teamMembers.map(async (member, index) => {
      return Team.findByIdAndUpdate(
        member._id,
        { order: index },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: "Team order updated successfully"
    });
  } catch (error) {
    console.error('Error reordering team members:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};