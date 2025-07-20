const express = require('express');
const router = express.Router();
const {
    createProject,
    updateProject,
    getAllProjects,
    getProjectById,
    deleteProject
} = require('../controllers/projectController');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/project/', adminAuthentication, createProject);
router.put('/project/:projectId', adminAuthentication, updateProject);
router.get('/projects/', getAllProjects);
router.get('/project/:projectId', getProjectById);
router.delete('/project/:projectId', adminAuthentication, deleteProject);

module.exports = router;
