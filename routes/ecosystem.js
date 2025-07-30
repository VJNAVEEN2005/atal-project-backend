const express = require('express');
const router = express.Router();
const { getEcosystemData, updateEcosystemData } = require('../controllers/ecosystemController');
const adminAuthentication = require('../middleware/adminAuthentication');

router.get('/ecosystems/getEcosystemData', getEcosystemData);
router.post('/ecosystems/updateEcosystemData',adminAuthentication, updateEcosystemData);

module.exports = router;