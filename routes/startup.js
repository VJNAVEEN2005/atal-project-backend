const express = require('express');
const startupController = require('../controllers/startupController');

const router = express.Router();

router
  .route('/startup/')
  .get(startupController.getAllStartups)
  .post(startupController.createStartup);

router
  .route('/startup/import')
  .post(startupController.importStartups);

router
  .route('/startup/:id')
  .get(startupController.getStartup)
  .patch(startupController.updateStartup)
  .delete(startupController.deleteStartup);

router
  .route('/startup/:id/image')
  .get(startupController.getStartupImage);

module.exports = router;