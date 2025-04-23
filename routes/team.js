const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Team member routes
router.post('/team/', teamController.uploadTeamImage, teamController.createTeamMember);
router.get('/team/', teamController.getTeamMembers);
router.get('/team/image/:id', teamController.getTeamMemberImage);
router.put('/team/:id', teamController.uploadTeamImage, teamController.updateTeamMember);
router.delete('/team/:id', teamController.deleteTeamMember);
router.post('/team/reorder', teamController.reorderTeamMembers);

module.exports = router;