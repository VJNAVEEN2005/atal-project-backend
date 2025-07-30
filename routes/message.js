const express = require('express');
const router = express.Router();
const multer = require('multer');
const messageController = require('../controllers/messageController');
const adminAuthentication = require('../middleware/adminAuthentication');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.get('/message/', messageController.getMessages);
router.post('/message/',adminAuthentication, upload.single('photo'), messageController.createMessage);
router.put('/message/:id',adminAuthentication ,upload.single('photo'), messageController.updateMessage);
router.delete('/message/:id',adminAuthentication , messageController.deleteMessage);
router.post('/message/reorder',adminAuthentication , messageController.reorderMessages);

module.exports = router;