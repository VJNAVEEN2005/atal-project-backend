const Project = require('../models/projectModel');
const multer = require('multer');
const XLSX = require('xlsx');

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

// Get all projects with pagination
exports.getAllProjects = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Extract optional filter parameters
        const { status, projectType, department, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (projectType) {
            filter.projectType = projectType;
        }
        if (department) {
            filter.department = department;
        }
        if (search) {
            filter.$or = [
                { projectTitle: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { instituteName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total count for pagination info
        const totalProjects = await Project.countDocuments(filter);
        const totalPages = Math.ceil(totalProjects / limit);
        
        // Get projects with pagination
        const projects = await Project.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);
        
        // Prepare response: convert image buffer to base64 or URL for each project
        const responseProjects = projects.map(project => {
            const obj = project.toObject();
            if (obj.image && obj.image.data) {
                //obj.imageUrl = `data:${obj.image.contentType};base64,${obj.image.data.toString('base64')}`;
                delete obj.image;
            }
            return obj;
        });
        
        return res.status(200).json({
            success: true,
            data: responseProjects,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalProjects: totalProjects,
                projectsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
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

// Serve project image directly by ID (returns actual image file)
exports.showProjectImageById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        if (!project.image || !project.image.data) {
            return res.status(404).json({
                success: false,
                message: 'Project image not found'
            });
        }
        
        // Set the appropriate content type
        res.set('Content-Type', project.image.contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Set filename if available
        if (project.image.fileName) {
            res.set('Content-Disposition', `inline; filename="${project.image.fileName}"`);
        }
        
        // Send the image buffer directly
        return res.send(project.image.data);
        
    } catch (error) {
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error retrieving project image: ' + error.message
        });
    }
};

// Export all projects data to Excel
exports.exportProjectsToExcel = async (req, res) => {
    try {
        // Extract optional filter parameters (same as getAllProjects)
        const { status, projectType, department, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (projectType) {
            filter.projectType = projectType;
        }
        if (department) {
            filter.department = department;
        }
        if (search) {
            filter.$or = [
                { projectTitle: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { instituteName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all projects (no pagination for export)
        const projects = await Project.find(filter).sort({ createdAt: -1 });
        
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found to export'
            });
        }
        
        // Prepare data for Excel export
        const excelData = projects.map((project, index) => {
            const obj = project.toObject();
            
            // Format project members as a string
            const projectMembersStr = obj.projectMembers && obj.projectMembers.length > 0 
                ? obj.projectMembers.map(member => 
                    `${member.name} (${member.regNo}) - ${member.department} - Year ${member.yearOfStudy}`
                  ).join('; ')
                : 'No members';
            
            // Format components as a string
            const componentsStr = obj.components && obj.components.length > 0 
                ? obj.components.join(', ')
                : 'No components';
            
            return {
                'S.No': index + 1,
                'Project ID': obj._id.toString(),
                'Student Name': obj.name || '',
                'Register Number': obj.registerNumber || '',
                'User ID': obj.userId || '',
                'Department': obj.department || '',
                'Email ID': obj.emailId || '',
                'Year of Study': obj.yearOfStudy || '',
                'Institute Name': obj.instituteName || '',
                'Project Type': obj.projectType || '',
                'Other Project Type': obj.otherProjectType || '',
                'Project Title': obj.projectTitle || '',
                'Lab Equipment Usage': obj.labEquipmentUsage || '',
                'Project Duration': obj.projectDuration || '',
                'Project Guide Name': obj.projectGuideName || '',
                'Project Members': projectMembersStr,
                'Components': componentsStr,
                'Status': obj.status || '',
                'Has Image': obj.image && obj.image.data ? 'Yes' : 'No',
                'Created Date': obj.createdAt ? new Date(obj.createdAt).toLocaleString() : '',
                'Updated Date': obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : ''
            };
        });
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths for better readability
        const columnWidths = [
            { wch: 8 },   // S.No
            { wch: 25 },  // Project ID
            { wch: 20 },  // Student Name
            { wch: 15 },  // Register Number
            { wch: 15 },  // User ID
            { wch: 15 },  // Department
            { wch: 25 },  // Email ID
            { wch: 12 },  // Year of Study
            { wch: 25 },  // Institute Name
            { wch: 15 },  // Project Type
            { wch: 20 },  // Other Project Type
            { wch: 30 },  // Project Title
            { wch: 20 },  // Lab Equipment Usage
            { wch: 15 },  // Project Duration
            { wch: 20 },  // Project Guide Name
            { wch: 50 },  // Project Members
            { wch: 30 },  // Components
            { wch: 10 },  // Status
            { wch: 10 },  // Has Image
            { wch: 20 },  // Created Date
            { wch: 20 }   // Updated Date
        ];
        worksheet['!cols'] = columnWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
        
        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx' 
        });
        
        // Set response headers for file download
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `projects_export_${timestamp}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file
        return res.send(excelBuffer);
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error exporting projects to Excel: ' + error.message
        });
    }
};


