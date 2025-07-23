const express = require('express');
const eventRecordController = require('../controllers/eventRecordController');
const adminAuthentication = require('../middleware/adminAuthentication');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuthentication);

router
  .route('/')
  .get(eventRecordController.getAllEventRecords)
  .post(eventRecordController.createEventRecord);

router
  .route('/:id')
  .get(eventRecordController.getEventRecord)
  .put(eventRecordController.updateEventRecord)
  .delete(eventRecordController.deleteEventRecord);

module.exports = router;
