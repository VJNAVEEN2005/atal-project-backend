const express = require('express');
const router = express.Router();
const {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerImage,
  updatePartnerOrder,
  upload
} = require('../controllers/partnerController');

// Public routes
router.get('/', getAllPartners);
router.get('/:id', getPartner);
router.get('/logo/:id', (req, res) => {
  req.params.type = 'logo';
  getPartnerImage(req, res);
});
router.get('/photo/:id', (req, res) => {
  req.params.type = 'photo';
  getPartnerImage(req, res);
});

// Protected routes (add your authentication middleware here)
// router.use(authenticate); // Uncomment and add your auth middleware

router.post('/', upload.single('image'), createPartner);
router.put('/:id', upload.single('image'), updatePartner);
router.delete('/:id', deletePartner);
router.put('/order/update', updatePartnerOrder);

module.exports = router;