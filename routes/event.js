const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/event/', eventController.createEvent);
router.get('/events/', eventController.getEvents);
router.get('/event/:id', eventController.getEvent);
router.put('/event/:id', eventController.updateEvent);
router.delete('/event/:id', eventController.deleteEvent);

module.exports = router;