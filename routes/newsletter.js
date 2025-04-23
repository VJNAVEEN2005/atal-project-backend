// routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Newsletter routes
router.post('/newsletter/', newsletterController.createNewsletter);
router.get('/newsletter/', newsletterController.getNewsletters);
router.get('/newsletter/:id', newsletterController.getNewsletter);
router.put('/newsletter/:id', newsletterController.updateNewsletter);
router.delete('/newsletter/:id', newsletterController.deleteNewsletter);

module.exports = router;