const express = require('express');
const startupController = require('../controllers/startupController');
const adminAuthentication = require('../middleware/adminAuthentication');
const {
  getAllStartups,
  getStartupsPaginated,
  searchStartups,
  advancedSearchStartups,
  getStartupsByCategory,
  getStartup,
  getStartupImage,
  getStartupImageInfo,
  deleteStartupImage,
  getStartupsWithImageStatus,
  createStartup,
  updateStartup,
  deleteStartup,
  importStartups
} = startupController;

const router = express.Router();

router
  .route('/startup/')
  .get(getAllStartups)
  .post(adminAuthentication, createStartup);

router
  .route('/startup/paginated')
  .get(getStartupsPaginated);

router
  .route('/startup/search')
  .get(searchStartups);

router
  .route('/startup/advanced-search')
  .get(advancedSearchStartups);

router
  .route('/startup/with-image-status')
  .get(getStartupsWithImageStatus);

router
  .route('/startup/category/:category')
  .get(getStartupsByCategory);

router
  .route('/startup/import')
  .post(adminAuthentication, importStartups);

router
  .route('/startup/:id')
  .get(getStartup)
  .patch(adminAuthentication, updateStartup)
  .delete(adminAuthentication, deleteStartup);

router
  .route('/startup/:id/image')
  .get(getStartupImage)
  .delete(deleteStartupImage);

router
  .route('/startup/:id/image/info')
  .get(getStartupImageInfo);

module.exports = router;