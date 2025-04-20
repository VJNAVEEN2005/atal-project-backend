const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// Public routes
router.get('/media/', mediaController.getAllMedia);
router.get('/media/sources', mediaController.getSources);
router.get('/media/:id', mediaController.getMediaById);

// Protected admin routes
router.post('/media/', mediaController.createMedia);
router.put('/media/:id', mediaController.updateMedia);
router.delete('/media/:id',  mediaController.deleteMedia);

module.exports = router;