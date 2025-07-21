const express = require('express');
const router = express.Router();
const {
    updateStockCount,
    getUpdateRecords
} = require('../controllers/updateStockRecordsController.js');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/update-stock', adminAuthentication, updateStockCount);
router.get('/update-records/:stockId', adminAuthentication, getUpdateRecords);

module.exports = router;
