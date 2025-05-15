
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
    
    if (!startup || !startup.image.data) {
      return res.status(404).json({
        status: 'fail',
        message: 'No image found for that startup ID'
      });
    }
    
    res.set('Content-Type', startup.image.contentType);
    res.send(startup.image.data);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new startup
exports.createStartup = (req, res) => {
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
        jobs: req.body.jobs,
        achievements: JSON.parse(req.body.achievements || '[]')
      };
      
      if (req.file) {
        startupData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      const newStartup = await Startup.create(startupData);
      
      // Don't send the image data back in the response
      const response = newStartup.toObject();
      delete response.image.data;
      
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