
const Startup = require('../models/Startup');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).single('image');

// Get all startups
exports.getAllStartups = async (req, res) => {
  try {
    const startups = await Startup.find().select('-image.data');
    res.status(200).json({
      status: 'success',
      results: startups.length,
      data: {
        startups
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get startups with pagination
exports.getStartupsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 10;
    const maxLimit = parseInt(req.query.maxLimit) || 100; // Maximum allowed limit
    const limit = Math.min(requestedLimit, maxLimit); // Ensure limit doesn't exceed maxLimit
    const skip = (page - 1) * limit;

    // Get total count of startups
    const totalStartups = await Startup.countDocuments();
    
    // Get startups for current page
    const startups = await Startup.find()
      .select('-image.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalStartups / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      status: 'success',
      results: startups.length,
      data: {
        startups
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalStartups: totalStartups,
        startupsPerPage: limit,
        requestedLimit: requestedLimit,
        maxLimit: maxLimit,
        limitApplied: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Search startups with pagination
exports.searchStartups = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 10;
    const maxLimit = parseInt(req.query.maxLimit) || 100; // Maximum allowed limit
    const limit = Math.min(requestedLimit, maxLimit); // Ensure limit doesn't exceed maxLimit
    const skip = (page - 1) * limit;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required'
      });
    }

    // Create search criteria using regex for case-insensitive search
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchCriteria = {
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { sector: { $regex: searchRegex } },
        { achievements: { $elemMatch: { $regex: searchRegex } } }
      ]
    };

    // Get total count of matching startups
    const totalStartups = await Startup.countDocuments(searchCriteria);
    
    if (totalStartups === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startups found matching the search criteria',
        searchQuery: search
      });
    }

    // Get startups for current page
    const startups = await Startup.find(searchCriteria)
      .select('-image.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalStartups / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      status: 'success',
      results: startups.length,
      data: {
        startups
      },
      searchQuery: search,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalStartups: totalStartups,
        startupsPerPage: limit,
        requestedLimit: requestedLimit,
        maxLimit: maxLimit,
        limitApplied: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Advanced search startups with filters and pagination
exports.advancedSearchStartups = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sector,
      foundedFrom,
      foundedTo,
      revenueMin,
      revenueMax,
      jobsMin,
      jobsMax,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 10;
    const maxLimit = parseInt(req.query.maxLimit) || 100; // Maximum allowed limit
    const limit = Math.min(requestedLimit, maxLimit); // Ensure limit doesn't exceed maxLimit
    const skip = (page - 1) * limit;

    // Build search criteria
    let searchCriteria = {};

    // Text search across multiple fields
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchCriteria.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { sector: { $regex: searchRegex } },
        { achievements: { $elemMatch: { $regex: searchRegex } } }
      ];
    }

    // Category filter
    if (category && category.trim() !== '') {
      searchCriteria.category = new RegExp(category.trim(), 'i');
    }

    // Sector filter
    if (sector && sector.trim() !== '') {
      searchCriteria.sector = new RegExp(sector.trim(), 'i');
    }

    // Founded year range filter
    if (foundedFrom || foundedTo) {
      searchCriteria.founded = {};
      if (foundedFrom) {
        searchCriteria.founded.$gte = parseInt(foundedFrom);
      }
      if (foundedTo) {
        searchCriteria.founded.$lte = parseInt(foundedTo);
      }
    }

    // Revenue range filter
    if (revenueMin || revenueMax) {
      searchCriteria.revenue = {};
      if (revenueMin) {
        searchCriteria.revenue.$gte = parseFloat(revenueMin);
      }
      if (revenueMax) {
        searchCriteria.revenue.$lte = parseFloat(revenueMax);
      }
    }

    // Jobs range filter
    if (jobsMin || jobsMax) {
      searchCriteria.jobs = {};
      if (jobsMin) {
        searchCriteria.jobs.$gte = parseInt(jobsMin);
      }
      if (jobsMax) {
        searchCriteria.jobs.$lte = parseInt(jobsMax);
      }
    }

    // Get total count of matching startups
    const totalStartups = await Startup.countDocuments(searchCriteria);
    
    if (totalStartups === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startups found matching the search criteria',
        searchCriteria: {
          search: search || '',
          category: category || '',
          sector: sector || '',
          foundedFrom: foundedFrom || '',
          foundedTo: foundedTo || '',
          revenueMin: revenueMin || '',
          revenueMax: revenueMax || '',
          jobsMin: jobsMin || '',
          jobsMax: jobsMax || ''
        }
      });
    }

    // Build sort criteria
    const sortCriteria = {};
    sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get startups for current page
    const startups = await Startup.find(searchCriteria)
      .select('-image.data')
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria);

    // Calculate pagination info
    const totalPages = Math.ceil(totalStartups / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      status: 'success',
      results: startups.length,
      data: {
        startups
      },
      searchCriteria: {
        search: search || '',
        category: category || '',
        sector: sector || '',
        foundedFrom: foundedFrom || '',
        foundedTo: foundedTo || '',
        revenueMin: revenueMin || '',
        revenueMax: revenueMax || '',
        jobsMin: jobsMin || '',
        jobsMax: jobsMax || '',
        sortBy: sortBy,
        sortOrder: sortOrder
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalStartups: totalStartups,
        startupsPerPage: limit,
        requestedLimit: requestedLimit,
        maxLimit: maxLimit,
        limitApplied: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get startups by category with pagination
exports.getStartupsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 10;
    const maxLimit = parseInt(req.query.maxLimit) || 100; // Maximum allowed limit
    const limit = Math.min(requestedLimit, maxLimit); // Ensure limit doesn't exceed maxLimit
    const skip = (page - 1) * limit;

    // Create case-insensitive search for category
    const categoryRegex = new RegExp(category, 'i');
    const searchCriteria = { category: categoryRegex };

    // Get total count of startups in category
    const totalStartups = await Startup.countDocuments(searchCriteria);
    
    if (totalStartups === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startups found for this category',
        category: category
      });
    }

    // Get startups for current page
    const startups = await Startup.find(searchCriteria)
      .select('-image.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalStartups / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      status: 'success',
      results: startups.length,
      data: {
        startups
      },
      category: category,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalStartups: totalStartups,
        startupsPerPage: limit,
        requestedLimit: requestedLimit,
        maxLimit: maxLimit,
        limitApplied: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single startup
exports.getStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    
    if (!startup) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startup found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        startup
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get startup image
exports.getStartupImage = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    
    if (!startup || !startup.image || !startup.image.data) {
      return res.status(404).json({
        status: 'fail',
        message: 'No image found for that startup ID'
      });
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': startup.image.contentType,
      'Content-Length': startup.image.data.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      'ETag': `"${req.params.id}-image"` // Simple ETag for caching
    });
    
    res.send(startup.image.data);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get startup image metadata (without binary data)
exports.getStartupImageInfo = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).select('image.contentType image.fileName');
    
    if (!startup || !startup.image) {
      return res.status(404).json({
        status: 'fail',
        message: 'No image found for that startup ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        imageInfo: {
          contentType: startup.image.contentType,
          fileName: startup.image.fileName || 'startup-image',
          hasImage: true,
          startupId: req.params.id
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete startup image
exports.deleteStartupImage = async (req, res) => {
  try {
    const startup = await Startup.findByIdAndUpdate(
      req.params.id,
      { $unset: { image: "" } },
      { new: true }
    );
    
    if (!startup) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startup found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Startup image deleted successfully',
      data: {
        startup: startup
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all startups with image status
exports.getStartupsWithImageStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 10;
    const maxLimit = parseInt(req.query.maxLimit) || 100;
    const limit = Math.min(requestedLimit, maxLimit);
    const skip = (page - 1) * limit;

    // Get startups with image status
    const startups = await Startup.find()
      .select('-image.data') // Exclude binary data
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Add image status to each startup
    const startupsWithImageStatus = startups.map(startup => {
      const startupObj = startup.toObject();
      startupObj.hasImage = !!(startup.image && startup.image.contentType);
      if (startupObj.image) {
        delete startupObj.image.data; // Ensure no binary data
      }
      return startupObj;
    });

    const totalStartups = await Startup.countDocuments();
    const totalPages = Math.ceil(totalStartups / limit);

    res.status(200).json({
      status: 'success',
      results: startupsWithImageStatus.length,
      data: {
        startups: startupsWithImageStatus
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalStartups: totalStartups,
        startupsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new startup
exports.createStartup = (req, res) => {
  console.log('Received request to create startup:', req.body);
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
    
    try {
      // Robust achievements parsing
      let achievements = [];
      if (Array.isArray(req.body.achievements)) {
        achievements = req.body.achievements;
      } else if (typeof req.body.achievements === 'string') {
        try {
          achievements = JSON.parse(req.body.achievements);
          if (!Array.isArray(achievements)) achievements = [achievements];
        } catch (e) {
          achievements = [req.body.achievements];
        }
      }

      const startupData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        founded: req.body.founded,
        revenue: req.body.revenue,
        sector: req.body.sector,
        jobs: req.body.jobs,
        achievements
      };
      
      // Only add image if a file is present
      if (req.file) {
        startupData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      const newStartup = await Startup.create(startupData);
      
      // Don't send the image data back in the response
      const response = newStartup.toObject();
      if (response.image && response.image.data) {
        delete response.image.data;
      }
      
      res.status(201).json({
        status: 'success',
        data: {
          startup: response
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  });
};

// Update a startup
exports.updateStartup = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
    
    try {
      const startupData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        founded: req.body.founded,
        revenue: req.body.revenue,
        sector: req.body.sector,
        jobs: req.body.jobs
      };
      
      if (req.body.achievements) {
        startupData.achievements = JSON.parse(req.body.achievements);
      }
      
      if (req.file) {
        startupData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      const startup = await Startup.findByIdAndUpdate(req.params.id, startupData, {
        new: true,
        runValidators: true
      });
      
      if (!startup) {
        return res.status(404).json({
          status: 'fail',
          message: 'No startup found with that ID'
        });
      }
      
      // Don't send the image data back in the response
      const response = startup.toObject();
      if (response.image && response.image.data) {
        delete response.image.data;
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          startup: response
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  });
};

// Delete a startup
exports.deleteStartup = async (req, res) => {
  try {
    const startup = await Startup.findByIdAndDelete(req.params.id);
    
    if (!startup) {
      return res.status(404).json({
        status: 'fail',
        message: 'No startup found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Import startup data from JSON
exports.importStartups = async (req, res) => {
  try {
    // This function expects an array of startup objects
    // For each startup, it will process any image paths and convert to buffer
    const startups = req.body.startups;
    
    if (!Array.isArray(startups)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid data format. Expected an array of startups.'
      });
    }
    
    const results = [];
    
    for (const startup of startups) {
      // If startup has an image path, read the file and convert to buffer
      if (startup.image && typeof startup.image === 'string') {
        try {
          // This assumes the images are accessible via the filesystem
          // You might need to adjust this based on your actual setup
          const imagePath = path.resolve(startup.image);
          const imageBuffer = fs.readFileSync(imagePath);
          const contentType = `image/${path.extname(imagePath).substring(1)}`;
          
          startup.image = {
            data: imageBuffer,
            contentType: contentType
          };
        } catch (error) {
          console.error(`Failed to process image for startup ${startup.title}:`, error);
          // Skip this image but continue with the import
          delete startup.image;
        }
      }
      
      const newStartup = await Startup.create(startup);
      const resultStartup = newStartup.toObject();
      if (resultStartup.image && resultStartup.image.data) {
        delete resultStartup.image.data;
      }
      results.push(resultStartup);
    }
    
    res.status(201).json({
      status: 'success',
      results: results.length,
      data: {
        startups: results
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};