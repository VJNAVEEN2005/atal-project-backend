const express = require('express');
const { createTender, getTenders } = require('../controllers/tenderController');
const router = express.Router();

router.route('/createTender').post(createTender); // Add this line to define the route for creating a tender
router.route('/getTenders').get(getTenders); // Add this line to define the route for getting tenders

module.exports = router;