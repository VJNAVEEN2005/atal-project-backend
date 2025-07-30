const express = require('express');
const router = express.Router();
const { getContactData, updateContactData } = require('../controllers/contactController');
const adminAuthentication = require('../middleware/adminAuthentication');

router.get('/contact/getContactData', getContactData);
router.put('/contact/update',adminAuthentication, updateContactData);

module.exports = router;