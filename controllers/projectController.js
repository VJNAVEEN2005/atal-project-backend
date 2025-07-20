const Project = require('../models/projectModel');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const projectData = req.body;
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
exports.updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const updatedData = req.body;
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
