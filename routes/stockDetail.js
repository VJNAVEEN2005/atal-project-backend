const express = require('express');
const multer = require('multer');
const upload = multer()
const router = express.Router();
const {
    createStockDetail,
    updateStockImage,
    getAllStockDetails,
    getStockDetailById,
    deleteStockDetail,
    getStockImage
} = require( '../controllers/stockDetailController.js');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/stock', upload.single('stockImage'),adminAuthentication, createStockDetail);
router.put('/stock/:id/image', adminAuthentication, updateStockImage);
router.get('/stock', getAllStockDetails);
router.get('/stock/:id', getStockDetailById);
router.delete('/stock/:id', deleteStockDetail);
router.get('/stock/:id/image', getStockImage);

module.exports = router;