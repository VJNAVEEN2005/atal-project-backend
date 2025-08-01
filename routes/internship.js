const express = require('express');
const router = express.Router();
const {
    createInternship,
    updateInternship,
    getAllInternships,
    getInternshipById,
    deleteInternship,
    getInternshipsByUserId,
    getInternshipsByEmailId,
    exportInternshipsToExcel
} = require('../controllers/internshipController');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/internship/',adminAuthentication, createInternship);
router.put('/internship/:internshipId', adminAuthentication,updateInternship);
router.get('/internships/', getAllInternships);
router.get('/internship/:internshipId', getInternshipById);
router.delete('/internship/:internshipId',adminAuthentication, deleteInternship);
router.get('/internships/user/:userId', getInternshipsByUserId);
router.get('/internships/email/:emailId', getInternshipsByEmailId);

// export all internships to Excel
router.get('/internships/export/excel', adminAuthentication, exportInternshipsToExcel);

module.exports = router;