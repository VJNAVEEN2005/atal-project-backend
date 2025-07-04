const Partner = require('../models/partnerModel');
const multer = require('multer');
const sharp = require('sharp');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all partners
const getAllPartners = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    if (type) {
      query.type = type;
    }
    
    const partners = await Partner.find(query)
      .select('-logo.data -photo.data') // Exclude image data from list
      .sort({ type: 1, order: 1, createdAt: -1 });
    
    // Add boolean flags for image existence
    const partnersWithImageFlags = partners.map(partner => ({
      ...partner.toObject(),
      logo: partner.logo && partner.logo.contentType ? true : false,
      photo: partner.photo && partner.photo.contentType ? true : false
    }));
    
    res.status(200).json({
      success: true,
      count: partnersWithImageFlags.length,
      data: partnersWithImageFlags
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message
    });
  }
};

// Get single partner
const getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .select('-logo.data -photo.data');
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    const partnerData = {
      ...partner.toObject(),
      logo: partner.logo && partner.logo.contentType ? true : false,
      photo: partner.photo && partner.photo.contentType ? true : false
    };
    
    res.status(200).json({
      success: true,
      data: partnerData
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner',
      error: error.message
    });
  }
};

// Create new partner
const createPartner = async (req, res) => {
  try {
    const { name, type, website, email, linkedin, details } = req.body;
    
    const partnerData = {
      name,
      type,
      website,
      email,
      linkedin,
      details,
       role,
      expertise,
      companyName
    };
    
    // Handle image upload
    if (req.file) {
      const isCompany = ['Academic', 'Corporate', 'IP Partners'].includes(type);
      let processedImage;
      
      if (isCompany) {
        // Process logo - maintain aspect ratio, max width 400px
        processedImage = await sharp(req.file.buffer)
          .resize(400, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .png({ quality: 80 })
          .toBuffer();
        
        partnerData.logo = {
          data: processedImage,
          contentType: 'image/png'
        };
      } else {
        // Process photo - square crop, 300x300px
        processedImage = await sharp(req.file.buffer)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .png({ quality: 80 })
          .toBuffer();
        
        partnerData.photo = {
          data: processedImage,
          contentType: 'image/png'
        };
      }
    }
    
    const partner = await Partner.create(partnerData);
    
    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: {
        ...partner.toObject(),
        logo: partner.logo && partner.logo.contentType ? true : false,
        photo: partner.photo && partner.photo.contentType ? true : false
      }
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating partner',
      error: error.message
    });
  }
};

// Update partner
const updatePartner = async (req, res) => {
  try {
    const { name, type, website, email, linkedin, details, role,expertise,companyName } = req.body;
    
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Update basic fields
    partner.name = name || partner.name;
    partner.type = type || partner.type;
    partner.website = website || partner.website;
    partner.email = email || partner.email;
    partner.linkedin = linkedin || partner.linkedin;
    partner.details = details || partner.details;
    partner.role = role || partner.role;
    partner.expertise = expertise || partner.expertise;
    partner.companyName = companyName || partner.companyName;

    
    // Handle image update
    if (req.file) {
      const isCompany = ['Academic', 'Corporate', 'IP Partners'].includes(partner.type);
      let processedImage;
      
      if (isCompany) {
        processedImage = await sharp(req.file.buffer)
          .resize(400, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .png({ quality: 80 })
          .toBuffer();
        
        partner.logo = {
          data: processedImage,
          contentType: 'image/png'
        };
        partner.photo = undefined; // Clear photo if switching to company
      } else {
        processedImage = await sharp(req.file.buffer)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .png({ quality: 80 })
          .toBuffer();
        
        partner.photo = {
          data: processedImage,
          contentType: 'image/png'
        };
        partner.logo = undefined; // Clear logo if switching to individual
      }
    }
    
    await partner.save();
    
    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: {
        ...partner.toObject(),
        logo: partner.logo && partner.logo.contentType ? true : false,
        photo: partner.photo && partner.photo.contentType ? true : false
      }
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating partner',
      error: error.message
    });
  }
};

// Delete partner
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    await Partner.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting partner',
      error: error.message
    });
  }
};

// Get partner logo/photo
const getPartnerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.params; // 'logo' or 'photo'
    
    const partner = await Partner.findById(id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    const imageField = type === 'logo' ? partner.logo : partner.photo;
    
    if (!imageField || !imageField.data) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.set('Content-Type', imageField.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(imageField.data);
  } catch (error) {
    console.error('Error fetching partner image:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching image',
      error: error.message
    });
  }
};

// Update partner order (for drag & drop)
const updatePartnerOrder = async (req, res) => {
  try {
    const { partners } = req.body; // Array of { id, order }
    
    const updatePromises = partners.map(({ id, order }) =>
      Partner.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Partner order updated successfully'
    });
  } catch (error) {
    console.error('Error updating partner order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating partner order',
      error: error.message
    });
  }
};

module.exports = {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerImage,
  updatePartnerOrder,
  upload
};