const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Team member routes
router.post('/team/',adminAuthentication, teamController.uploadTeamImage, teamController.createTeamMember);
router.get('/team/', teamController.getTeamMembers);
router.get('/team/image/:id', teamController.getTeamMemberImage);
router.put('/team/:id',adminAuthentication, teamController.uploadTeamImage, teamController.updateTeamMember);
router.delete('/team/:id',adminAuthentication, teamController.deleteTeamMember);
router.post('/team/reorder',adminAuthentication, teamController.reorderTeamMembers);

module.exports = router;