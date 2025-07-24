const express = require('express');
const router = express.Router();
const { getContactData, updateContactData } = require('../controllers/contactController');

router.get('/contact/getContactData', getContactData);
router.put('/contact/update', updateContactData);

module.exports = router;