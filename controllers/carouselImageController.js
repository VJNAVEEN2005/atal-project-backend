const CarouselImage = require('../models/carouselImageModel');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper to handle file upload middleware
const uploadImage = upload.single('image');

// Create a new carousel image
exports.createCarouselImage = async (req, res) => {
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
      
      // Check if image file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }
      
      // Get the current maximum order to place new image at the end
      const maxOrderImage = await CarouselImage.findOne().sort({ order: -1 });
      const nextOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;
      
      // Process the uploaded file
      const imageData = {
        title: req.body.title,
        description: req.body.description || '',
        altText: req.body.altText || '',
        order: nextOrder,
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      };
      
      // Create the carousel image
      const newImage = await CarouselImage.create(imageData);
      
      // Convert buffer to base64 for front-end display
      const responseImage = newImage.toObject();
      if (responseImage.image && responseImage.image.data) {
        responseImage.imageUrl = `data:${responseImage.image.contentType};base64,${responseImage.image.data.toString('base64')}`;
        delete responseImage.image; // Remove raw buffer from response
      }
      
      return res.status(201).json({ 
        success: true, 
        message: "Carousel image created successfully", 
        image: responseImage 
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all carousel images
exports.getCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({ isActive: true }).sort({ order: 1 });
    
    // Convert all buffer data to base64 URLs
    const imagesWithUrls = images.map(image => {
      const imageObj = image.toObject();
      if (imageObj.image && imageObj.image.data) {
        imageObj.imageUrl = `data:${imageObj.image.contentType};base64,${imageObj.image.data.toString('base64')}`;
        delete imageObj.image; // Remove raw buffer from response
      }
      return imageObj;
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Carousel images fetched successfully", 
      images: imagesWithUrls
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get a single carousel image
exports.getCarouselImage = async (req, res) => {
  try {
    const image = await CarouselImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Carousel image not found" 
      });
    }
    
    // Convert buffer to base64
    const imageObj = image.toObject();
    if (imageObj.image && imageObj.image.data) {
      imageObj.imageUrl = `data:${imageObj.image.contentType};base64,${imageObj.image.data.toString('base64')}`;
      delete imageObj.image; // Remove raw buffer from response
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Carousel image fetched successfully", 
      image: imageObj
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update a carousel image
exports.updateCarouselImage = async (req, res) => {
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
      
      // Get existing image
      const existingImage = await CarouselImage.findById(req.params.id);
      
      if (!existingImage) {
        return res.status(404).json({ 
          success: false, 
          message: "Carousel image not found" 
        });
      }
      
      // Prepare update data
      const updateData = {
        title: req.body.title,
        description: req.body.description || '',
        altText: req.body.altText || ''
      };
      
      // Update image if a new file was uploaded
      if (req.file) {
        updateData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      // Update the carousel image
      const updatedImage = await CarouselImage.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Convert buffer to base64 for response
      const responseImage = updatedImage.toObject();
      if (responseImage.image && responseImage.image.data) {
        responseImage.imageUrl = `data:${responseImage.image.contentType};base64,${responseImage.image.data.toString('base64')}`;
        delete responseImage.image; // Remove raw buffer from response
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Carousel image updated successfully", 
        image: responseImage
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete a carousel image
exports.deleteCarouselImage = async (req, res) => {
  try {
    const image = await CarouselImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Carousel image not found" 
      });
    }
    
    // Soft delete by setting isActive to false
    await CarouselImage.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Alternatively, for hard delete, use:
    // await CarouselImage.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ 
      success: true, 
      message: "Carousel image deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reorder carousel images
exports.reorderCarouselImages = async (req, res) => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }
    
    // Update each image's order
    const updatePromises = images.map(img => 
      CarouselImage.findByIdAndUpdate(
        img._id, 
        { order: img.order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: 'Carousel images reordered successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle image active status
exports.toggleCarouselImageStatus = async (req, res) => {
  try {
    const image = await CarouselImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Carousel image not found'
      });
    }
    
    // Toggle the isActive status
    const updatedImage = await CarouselImage.findByIdAndUpdate(
      req.params.id,
      { isActive: !image.isActive },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: `Carousel image ${updatedImage.isActive ? 'activated' : 'deactivated'} successfully`,
      image: updatedImage
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get carousel images for public display (only active images)
exports.getPublicCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({ isActive: true })
      .sort({ order: 1 })
      .select('title description altText order createdAt');
    
    // Convert buffer data to base64 URLs for public display
    const publicImages = images.map(image => {
      const imageObj = image.toObject();
      if (imageObj.image && imageObj.image.data) {
        imageObj.imageUrl = `data:${imageObj.image.contentType};base64,${imageObj.image.data.toString('base64')}`;
        delete imageObj.image;
      }
      return imageObj;
    });
    
    return res.status(200).json({
      success: true,
      images: publicImages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};