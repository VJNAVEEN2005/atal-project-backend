const express = require('express');
const router = express.Router();
const {
    createInternship,
    updateInternship,
    getAllInternships,
    getInternshipById,
    deleteInternship
} = require('../controllers/internshipController');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/internship/',adminAuthentication, createInternship);
router.put('/internship/:internshipId', adminAuthentication,updateInternship);
router.get('/internships/', getAllInternships);
router.get('/internship/:internshipId', getInternshipById);
router.delete('/internship/:internshipId',adminAuthentication, deleteInternship);

module.exports = router;