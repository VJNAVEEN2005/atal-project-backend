const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Public routes
router.get('/media/', mediaController.getAllMedia);
router.get('/media/sources', mediaController.getSources);
router.get('/media/:id', mediaController.getMediaById);

// Protected admin routes
router.post('/media/',adminAuthentication, mediaController.createMedia);
router.put('/media/:id',adminAuthentication, mediaController.updateMedia);
router.delete('/media/:id',adminAuthentication, mediaController.deleteMedia);

module.exports = router;