const express = require('express');
const { updateProgramsForm, getProgramsForm } = require('../controllers/programsformController');
const adminAuthentication = require('../middleware/adminAuthentication');

const router = express.Router();

router.put('/programsform', adminAuthentication, updateProgramsForm);
router.get('/programsform', getProgramsForm);

module.exports = router;
