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
    getStockImage,
    exportStockDetailsToExcel
} = require( '../controllers/stockDetailController.js');
const adminAuthentication = require('../middleware/adminAuthentication.js');

router.post('/stock', upload.single('stockImage'),adminAuthentication, createStockDetail);
router.put('/stock/:id/image', adminAuthentication, updateStockImage);
router.get('/stock', getAllStockDetails);
router.get('/stock/:id', getStockDetailById);
router.delete('/stock/:id', adminAuthentication, deleteStockDetail);
router.get('/stock/:id/image', getStockImage);

// export all stock details to Excel
router.get('/stock/export/excel', adminAuthentication, exportStockDetailsToExcel);

module.exports = router;