const express = require('express');
const eventRecordController = require('../controllers/eventRecordController');
const adminAuthentication = require('../middleware/adminAuthentication');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuthentication);

// Event summary and overview routes
router
  .route('/overview')
  .get(eventRecordController.getEventsOverview);

router
  .route('/summary')
  .get(eventRecordController.getEventSummary);

router
  .route('/summary/:eventName')
  .get(eventRecordController.getSpecificEventSummary);

// Event registrations routes
router
  .route('/registrations')
  .get(eventRecordController.getAllEventRecords)
  .post(eventRecordController.createEventRecord);

router
  .route('/registrations/bulk')
  .post(eventRecordController.bulkCreateEventRecords);

// Export routes (supporting both formats for compatibility)
router
  .route('/registrations/export/excel')
  .get(eventRecordController.exportEventRecordsToExcel);

router
  .route('/registrations/export-excel')
  .get(eventRecordController.exportEventRecordsToExcel);

router
  .route('/registrations/:id')
  .get(eventRecordController.getEventRecord)
  .put(eventRecordController.updateEventRecord)
  .delete(eventRecordController.deleteEventRecord);

  router
  .route('/records/update-by-eventname/:eventName')
  .put(eventRecordController.updateEventByEventName);

// Legacy routes (for backward compatibility)
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
