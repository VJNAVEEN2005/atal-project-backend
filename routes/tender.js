const express = require('express');
const multer = require('multer');
const { createTender, getTenders, downloadTender, deleteTender } = require('../controllers/tenderController');
const router = express.Router();

// Configure multer for memory storage (files will be stored in memory as Buffer objects)
const storage = multer.memoryStorage();

// Set file filter to only accept PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Configure the upload middleware with size limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

// Route for creating a tender with file upload
router.post('/createTender', upload.single('tenderFile'), createTender);

// Route for getting all tenders
router.get('/getTenders', getTenders);

// Route for downloading a tender document
router.get('/downloadTender/:id', downloadTender);

// Route for deleting a tender
router.delete('/deleteTender/:id', deleteTender);

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'File too large. Maximum size is 10MB' 
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
        // An unknown error occurred
        return res.status(500).json({ success: false, message: err.message });
    }
    next();
});

module.exports = router;