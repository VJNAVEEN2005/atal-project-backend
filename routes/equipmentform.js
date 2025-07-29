const express = require('express');
const { updateEquipmentForm, getEquipmentForm, deleteEquipmentForm } = require('../controllers/equipmentformController');
const adminAuthentication = require('../middleware/adminAuthentication');

const router = express.Router();

// Update or create equipment form (admin only) - supports both POST and PUT
router.put('/equipmentforms', adminAuthentication, updateEquipmentForm);
router.post('/equipmentforms', adminAuthentication, updateEquipmentForm);

// Get equipment form (public)
router.get('/equipmentforms', getEquipmentForm);

// Delete equipment form (admin only)
router.delete('/equipmentforms', adminAuthentication, deleteEquipmentForm);

module.exports = router;
