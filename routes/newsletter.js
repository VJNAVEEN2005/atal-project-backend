// routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Newsletter routes
router.post('/newsletter/',adminAuthentication, newsletterController.createNewsletter);
router.get('/newsletter/', newsletterController.getNewsletters);
router.get('/newsletter/:id', newsletterController.getNewsletter);
router.put('/newsletter/:id', newsletterController.updateNewsletter);
router.delete('/newsletter/:id', newsletterController.deleteNewsletter);

module.exports = router;