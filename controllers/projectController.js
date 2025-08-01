const Project = require('../models/projectModel');
const multer = require('multer');

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export the upload middleware for single image
exports.uploadProjectImage = upload.single('image');

// Create a new project
// You can provide 'status' (either 'active' or 'completed') in the request body. If omitted, it defaults to 'active'.
exports.createProject = async (req, res) => {
    try {
        const projectData = req.body;
        // Parse arrays sent as strings by FormData
        if (typeof projectData.projectMembers === 'string') {
            projectData.projectMembers = JSON.parse(projectData.projectMembers);
        }
        if (typeof projectData.components === 'string') {
            projectData.components = JSON.parse(projectData.components);
        }
        // Handle image upload if present
        if (req.file) {
            projectData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname
            };
        }
        // status will default to 'active' if not provided, as per schema
        const newProject = await Project.create(projectData);
        // Prepare response: convert image buffer to base64 or URL
        const responseProject = newProject.toObject();
        if (responseProject.image && responseProject.image.data) {
            responseProject.imageUrl = `data:${responseProject.image.contentType};base64,${responseProject.image.data.toString('base64')}`;
            delete responseProject.image;
        }
        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: responseProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update an existing project
// You can update the 'status' field to either 'active' or 'completed'.
exports.updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const updatedData = req.body;
        // Parse arrays sent as strings by FormData
        if (typeof updatedData.projectMembers === 'string') {
            updatedData.projectMembers = JSON.parse(updatedData.projectMembers);
        }
        if (typeof updatedData.components === 'string') {
            updatedData.components = JSON.parse(updatedData.components);
        }

        // Validate status if provided
        if (updatedData.status && !['active', 'completed'].includes(updatedData.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value. Must be 'active' or 'completed'."
            });
        }

        // Handle image upload if present
        if (req.file) {
            updatedData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname
            };
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updatedData,
            { new: true, runValidators: true }
        );
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        // Prepare response: convert image buffer to base64 or URL
        const responseProject = updatedProject.toObject();
        if (responseProject.image && responseProject.image.data) {
            responseProject.imageUrl = `data:${responseProject.image.contentType};base64,${responseProject.image.data.toString('base64')}`;
            delete responseProject.image;
        }
        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: responseProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        // Prepare response: convert image buffer to base64 or URL for each project
        const responseProjects = projects.map(project => {
            const obj = project.toObject();
            if (obj.image && obj.image.data) {
                obj.imageUrl = `data:${obj.image.contentType};base64,${obj.image.data.toString('base64')}`;
                delete obj.image;
            }
            return obj;
        });
        return res.status(200).json({
            success: true,
            data: responseProjects
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        // Prepare response: convert image buffer to base64 or URL
        const responseProject = project.toObject();
        if (responseProject.image && responseProject.image.data) {
            responseProject.imageUrl = `data:${responseProject.image.contentType};base64,${responseProject.image.data.toString('base64')}`;
            delete responseProject.image;
        }
        return res.status(200).json({
            success: true,
            data: responseProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// get projects by user ID
exports.getProjectsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project.find({ userId });
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found for this user'
            });
        }
        // Prepare response: convert image buffer to base64 or URL for each project
        const responseProjects = projects.map(project => {
            const obj = project.toObject();
            if (obj.image && obj.image.data) {
                obj.imageUrl = `data:${obj.image.contentType};base64,${obj.image.data.toString('base64')}`;
                delete obj.image;
            }
            return obj;
        });
        return res.status(200).json({
            success: true,
            data: responseProjects
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// get projects by emailId
exports.getProjectsByEmailId = async (req, res) => {
    try {
        const { emailId } = req.params;
        const projects = await Project.find({ emailId });
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found for this email ID'
            });
        }
        // Prepare response: convert image buffer to base64 or URL for each project
        const responseProjects = projects.map(project => {
            const obj = project.toObject();
            if (obj.image && obj.image.data) {
                obj.imageUrl = `data:${obj.image.contentType};base64,${obj.image.data.toString('base64')}`;
                delete obj.image;
            }
            return obj;
        });
        return res.status(200).json({
            success: true,
            data: responseProjects
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


