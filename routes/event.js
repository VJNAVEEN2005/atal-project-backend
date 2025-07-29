const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/event/', eventController.createEvent);
router.get('/events/', eventController.getEvents);
router.get('/event/:id', eventController.getEvent);
router.put('/event/:id', eventController.updateEvent);
router.delete('/event/:id', eventController.deleteEvent);

// Paging and summary routes
router.get('/events/paged', eventController.getEventsPaged);
router.get('/events/summary', eventController.getEventSummary);
// Add new route
router.get('/events/dates', eventController.getEventDates);

// Route to get upcoming events
router.get('/events/upcoming', eventController.getUpcomingEvents);

module.exports = router;