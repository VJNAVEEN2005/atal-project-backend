const Project = require('../models/projectModel');

// Create a new project
// You can provide 'status' (either 'active' or 'completed') in the request body. If omitted, it defaults to 'active'.
exports.createProject = async (req, res) => {
    try {
        const projectData = req.body;
        // status will default to 'active' if not provided, as per schema
        const newProject = await Project.create(projectData);
        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: newProject
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

        // Validate status if provided
        if (updatedData.status && !['active', 'completed'].includes(updatedData.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value. Must be 'active' or 'completed'."
            });
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
        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: updatedProject
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
        return res.status(200).json({
            success: true,
            data: projects
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
        return res.status(200).json({
            success: true,
            data: project
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
        return res.status(200).json({
            success: true,
            data: projects
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
        return res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


