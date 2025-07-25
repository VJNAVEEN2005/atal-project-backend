const express = require('express');
const router = express.Router();
const {
    createProject,
    updateProject,
    getAllProjects,
    getProjectById,
    deleteProject,
    getProjectsByUserId,
    getProjectsByEmailId,
    updateProjectImage
} = require('../controllers/projectController');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/project/', adminAuthentication, createProject);
router.put('/project/:projectId', adminAuthentication, updateProject);
router.get('/projects/', getAllProjects);
router.get('/project/:projectId', getProjectById);
router.delete('/project/:projectId', adminAuthentication, deleteProject);

// get projects by user ID
router.get('/user/:userId/projects', getProjectsByUserId);

// get projects by email ID
router.get('/email/:emailId/projects', getProjectsByEmailId);

module.exports = router;
