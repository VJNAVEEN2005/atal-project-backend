const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselImageController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Admin routes for carousel management
router.post('/carousel-images',adminAuthentication, carouselController.createCarouselImage);
router.get('/carousel-images', carouselController.getCarouselImages);
router.get('/carousel-images/:id', carouselController.getCarouselImage);
router.put('/carousel-images/:id',adminAuthentication, carouselController.updateCarouselImage);
router.delete('/carousel-images/:id',adminAuthentication, carouselController.deleteCarouselImage);
router.post('/carousel-images/reorder',adminAuthentication, carouselController.reorderCarouselImages);
router.patch('/carousel-images/:id/toggle-status',adminAuthentication, carouselController.toggleCarouselImageStatus);

// Public route for displaying carousel images
router.get('/carousel-images/public/display', carouselController.getPublicCarouselImages);

module.exports = router;