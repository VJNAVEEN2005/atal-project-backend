const express = require('express');
const router = express.Router();
const {
  createRoadmapItem,
  getAllRoadmapItems,
  getRoadmapItemById,
  updateRoadmapItem,
  deleteRoadmapItem,
  getYears,
  getRoadmapStats
} = require('../controllers/roadmapController');

// Public routes
router.get('/roadmap', getAllRoadmapItems);
router.get('/roadmap/years', getYears);
router.get('/roadmap/stats', getRoadmapStats);
router.get('/roadmap/:id', getRoadmapItemById);

// Protected routes - only admin can modify roadmap
router.post('/roadmap',  createRoadmapItem);
router.put('/roadmap/:id',  updateRoadmapItem);
router.delete('/roadmap/:id', deleteRoadmapItem);

module.exports = router;