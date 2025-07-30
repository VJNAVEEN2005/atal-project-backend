const express = require('express');
const multer = require('multer');
const router = express.Router();
const { createTender, getTenders, downloadTender, deleteTender } = require('../controllers/tenderController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    },
    fileFilter: fileFilter
});

router.post('/createTender', adminAuthentication ,upload.single('tenderFile'), createTender);
router.get('/getTenders', getTenders);
router.get('/downloadTender/:id', downloadTender);
router.delete('/deleteTender/:id', adminAuthentication, deleteTender);

// Error handling middleware
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
                success: false, 
                message: 'File too large. Maximum size is 100MB' 
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
    next();
});

module.exports = router;