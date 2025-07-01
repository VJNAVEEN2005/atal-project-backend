const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselImageController');

// Admin routes for carousel management
router.post('/carousel-images', carouselController.createCarouselImage);
router.get('/carousel-images', carouselController.getCarouselImages);
router.get('/carousel-images/:id', carouselController.getCarouselImage);
router.put('/carousel-images/:id', carouselController.updateCarouselImage);
router.delete('/carousel-images/:id', carouselController.deleteCarouselImage);
router.post('/carousel-images/reorder', carouselController.reorderCarouselImages);
router.patch('/carousel-images/:id/toggle-status', carouselController.toggleCarouselImageStatus);

// Public route for displaying carousel images
router.get('/carousel-images/public/display', carouselController.getPublicCarouselImages);

module.exports = router;