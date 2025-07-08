const express = require('express');
const router = express.Router();
const { getEcosystemData, updateEcosystemData } = require('../controllers/ecosystemController');

router.get('/ecosystems/getEcosystemData', getEcosystemData);
router.post('/ecosystems/updateEcosystemData', updateEcosystemData);

module.exports = router;