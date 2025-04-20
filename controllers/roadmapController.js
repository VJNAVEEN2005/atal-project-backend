const Roadmap = require('../models/roadmapModel');

// Create new roadmap item
exports.createRoadmapItem = async (req, res) => {
  try {
    const { year, month, event } = req.body;
    
    // Validate required fields
    if (!year || !month || !event) {
      return res.status(400).json({
        success: false,
        message: 'Please provide year, month and event description'
      });
    }
    
    // Create new roadmap entry
    const newRoadmapItem = await Roadmap.create({
      year,
      month,
      event
    });
    
    return res.status(201).json({
      success: true,
      message: 'Roadmap item added successfully',
      roadmapItem: newRoadmapItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all roadmap items
exports.getAllRoadmapItems = async (req, res) => {
  try {
    // Get query parameters for sorting
    const { sortBy = 'year', sortOrder = 'asc' } = req.query;
    
    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Add secondary sort by month for consistent ordering
    if (sortBy !== 'month') {
      sort.month = 1; // Sort months alphabetically within each year
    }
    
    // Fetch all roadmap items
    const roadmapItems = await Roadmap.find().sort(sort);
    
    return res.status(200).json({
      success: true,
      message: 'Roadmap items fetched successfully',
      roadmapItems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get roadmap item by ID
exports.getRoadmapItemById = async (req, res) => {
  try {
    const roadmapItem = await Roadmap.findById(req.params.id);
    
    if (!roadmapItem) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Roadmap item fetched successfully',
      roadmapItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update roadmap item
exports.updateRoadmapItem = async (req, res) => {
  try {
    const { year, month, event } = req.body;
    
    // Validate required fields
    if (!year || !month || !event) {
      return res.status(400).json({
        success: false,
        message: 'Please provide year, month and event description'
      });
    }
    
    // Find and update the roadmap item
    const updatedRoadmapItem = await Roadmap.findByIdAndUpdate(
      req.params.id,
      { year, month, event },
      { new: true, runValidators: true }
    );
    
    if (!updatedRoadmapItem) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Roadmap item updated successfully',
      roadmapItem: updatedRoadmapItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete roadmap item
exports.deleteRoadmapItem = async (req, res) => {
  try {
    const roadmapItem = await Roadmap.findByIdAndDelete(req.params.id);
    
    if (!roadmapItem) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Roadmap item deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unique years
exports.getYears = async (req, res) => {
  try {
    const years = await Roadmap.distinct('year');
    
    // Sort years in descending order (newest first)
    years.sort((a, b) => b - a);
    
    return res.status(200).json({
      success: true,
      years
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get roadmap statistics
exports.getRoadmapStats = async (req, res) => {
  try {
    const totalItems = await Roadmap.countDocuments();
    const yearsCount = (await Roadmap.distinct('year')).length;
    
    return res.status(200).json({
      success: true,
      stats: {
        totalMilestones: totalItems,
        yearsOfGrowth: yearsCount,
        majorEvents: totalItems > 10 ? '10+' : totalItems
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};