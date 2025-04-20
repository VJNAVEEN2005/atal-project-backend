const Media = require('../models/mediaModel');
const multer = require('multer');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper to handle file upload middleware
const uploadImage = upload.single('image');

// Create new media coverage
exports.createMedia = async (req, res) => {
  try {
    // Use multer to handle file upload
    uploadImage(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          success: false, 
          message: 'File upload error: ' + err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      
      // Process the uploaded file if it exists
      const mediaData = { ...req.body };
      
      if (req.file) {
        mediaData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      // Create the media entry with or without image
      const newMedia = await Media.create(mediaData);
      
      // Convert buffer to base64 for front-end display
      const responseMedia = newMedia.toObject();
      if (responseMedia.image && responseMedia.image.data) {
        responseMedia.image.data = responseMedia.image.data.toString('base64');
      }
      
      return res.status(201).json({ 
        success: true, 
        message: "Media coverage created successfully", 
        media: responseMedia 
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all media coverage
exports.getAllMedia = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { source, category, search, sort = 'newest' } = req.query;
    
    // Build filter object
    const filter = {};
    if (source && source !== 'All') filter.source = source;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Determine sort order
    const sortOrder = sort === 'newest' ? { date: -1 } : { date: 1 };
    
    // Fetch media with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const mediaItems = await Media.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCount = await Media.countDocuments(filter);
    
    // Convert all buffer data to base64
    const mediaWithBase64 = mediaItems.map(media => {
      const mediaObj = media.toObject();
      if (mediaObj.image && mediaObj.image.data) {
        mediaObj.image.data = mediaObj.image.data.toString('base64');
      }
      return mediaObj;
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Media coverage fetched successfully", 
      mediaItems: mediaWithBase64,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single media coverage by ID
exports.getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ 
        success: false, 
        message: "Media coverage not found" 
      });
    }
    
    // Convert buffer to base64
    const mediaObj = media.toObject();
    if (mediaObj.image && mediaObj.image.data) {
      mediaObj.image.data = mediaObj.image.data.toString('base64');
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Media coverage fetched successfully", 
      media: mediaObj
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update media coverage
exports.updateMedia = async (req, res) => {
  try {
    uploadImage(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          success: false, 
          message: 'File upload error: ' + err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      
      // Get existing media
      const existingMedia = await Media.findById(req.params.id);
      
      if (!existingMedia) {
        return res.status(404).json({ 
          success: false, 
          message: "Media coverage not found" 
        });
      }
      
      // Prepare update data
      const updateData = { ...req.body };
      
      // Update image if a new file was uploaded
      if (req.file) {
        updateData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      // Update the media
      const updatedMedia = await Media.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Convert buffer to base64 for response
      const responseMedia = updatedMedia.toObject();
      if (responseMedia.image && responseMedia.image.data) {
        responseMedia.image.data = responseMedia.image.data.toString('base64');
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Media coverage updated successfully", 
        media: responseMedia
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete media coverage
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    
    if (!media) {
      return res.status(404).json({ 
        success: false, 
        message: "Media coverage not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Media coverage deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get unique sources for filter dropdown
exports.getSources = async (req, res) => {
  try {
    const sources = await Media.distinct('source');
    return res.status(200).json({ 
      success: true, 
      sources: ['All', ...sources]
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};