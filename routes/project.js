const express = require('express');
const router = express.Router();
const {
    uploadProjectImage,
    createProject,
    updateProject,
    getAllProjects,
    getProjectById,
    deleteProject,
    getProjectsByUserId,
    getProjectsByEmailId,
    showProjectImageById,
    exportProjectsToExcel
} = require('../controllers/projectController');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/project/', adminAuthentication, uploadProjectImage, createProject);
router.put('/project/:projectId', adminAuthentication, uploadProjectImage, updateProject);
router.get('/projects/', getAllProjects);
router.get('/project/:projectId', getProjectById);
router.delete('/project/:projectId', adminAuthentication, deleteProject);

// get projects by user ID
router.get('/user/:userId/projects', getProjectsByUserId);

// get projects by email ID
router.get('/email/:emailId/projects', getProjectsByEmailId);

// get project image by ID
router.get('/project/:projectId/image', showProjectImageById);

// export all projects to Excel
router.get('/projects/export/excel', adminAuthentication, exportProjectsToExcel);

module.exports = router;
