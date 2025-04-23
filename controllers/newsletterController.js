// controllers/newsletterController.js
const Newsletter = require('../models/newsletterModel');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      // Accept only images for cover
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed for cover!'), false);
      }
    } else if (file.fieldname === 'pdfFile') {
      // Accept only PDFs for newsletter file
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// Helper to handle file upload middleware
const uploadFiles = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]);

exports.createNewsletter = async (req, res) => {
  try {
    uploadFiles(req, res, async function(err) {
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
      
      // Process the uploaded files
      const newsletterData = {
        title: req.body.title,
        year: req.body.year
      };
      
      // Add cover image if provided
      if (req.files['coverImage'] && req.files['coverImage'][0]) {
        newsletterData.coverImage = {
          data: req.files['coverImage'][0].buffer,
          contentType: req.files['coverImage'][0].mimetype
        };
      }
      
      // Add PDF file if provided
      if (req.files['pdfFile'] && req.files['pdfFile'][0]) {
        newsletterData.pdfFile = {
          data: req.files['pdfFile'][0].buffer,
          contentType: req.files['pdfFile'][0].mimetype
        };
      }
      
      // Create the newsletter
      const newNewsletter = await Newsletter.create(newsletterData);
      
      // Prepare response (convert buffers to base64)
      const responseNewsletter = newNewsletter.toObject();
      if (responseNewsletter.coverImage && responseNewsletter.coverImage.data) {
        responseNewsletter.coverImage.data = responseNewsletter.coverImage.data.toString('base64');
      }
      if (responseNewsletter.pdfFile && responseNewsletter.pdfFile.data) {
        responseNewsletter.pdfFile.data = responseNewsletter.pdfFile.data.toString('base64');
      }
      
      return res.status(201).json({
        success: true,
        message: "Newsletter created successfully",
        newsletter: responseNewsletter
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({}).sort({ year: -1, title: -1 });
    
    // Convert all buffer data to base64
    const newslettersWithBase64 = newsletters.map(newsletter => {
      const newsletterObj = newsletter.toObject();
      if (newsletterObj.coverImage && newsletterObj.coverImage.data) {
        newsletterObj.coverImage.data = newsletterObj.coverImage.data.toString('base64');
      }
      if (newsletterObj.pdfFile && newsletterObj.pdfFile.data) {
        newsletterObj.pdfFile.data = newsletterObj.pdfFile.data.toString('base64');
      }
      return newsletterObj;
    });
    
    return res.status(200).json({
      success: true,
      message: "Newsletters fetched successfully",
      newsletters: newslettersWithBase64
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found"
      });
    }
    
    // Convert buffer to base64
    const newsletterObj = newsletter.toObject();
    if (newsletterObj.coverImage && newsletterObj.coverImage.data) {
      newsletterObj.coverImage.data = newsletterObj.coverImage.data.toString('base64');
    }
    if (newsletterObj.pdfFile && newsletterObj.pdfFile.data) {
      newsletterObj.pdfFile.data = newsletterObj.pdfFile.data.toString('base64');
    }
    
    return res.status(200).json({
      success: true,
      message: "Newsletter fetched successfully",
      newsletter: newsletterObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    uploadFiles(req, res, async function(err) {
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
      
      // Get existing newsletter
      const existingNewsletter = await Newsletter.findById(req.params.id);
      
      if (!existingNewsletter) {
        return res.status(404).json({
          success: false,
          message: "Newsletter not found"
        });
      }
      
      // Prepare update data
      const updateData = {
        title: req.body.title || existingNewsletter.title,
        year: req.body.year || existingNewsletter.year
      };
      
      // Update cover image if a new file was uploaded
      if (req.files['coverImage'] && req.files['coverImage'][0]) {
        updateData.coverImage = {
          data: req.files['coverImage'][0].buffer,
          contentType: req.files['coverImage'][0].mimetype
        };
      }
      
      // Update PDF file if a new file was uploaded
      if (req.files['pdfFile'] && req.files['pdfFile'][0]) {
        updateData.pdfFile = {
          data: req.files['pdfFile'][0].buffer,
          contentType: req.files['pdfFile'][0].mimetype
        };
      }
      
      // Update the newsletter
      const updatedNewsletter = await Newsletter.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Convert buffer to base64 for response
      const responseNewsletter = updatedNewsletter.toObject();
      if (responseNewsletter.coverImage && responseNewsletter.coverImage.data) {
        responseNewsletter.coverImage.data = responseNewsletter.coverImage.data.toString('base64');
      }
      if (responseNewsletter.pdfFile && responseNewsletter.pdfFile.data) {
        responseNewsletter.pdfFile.data = responseNewsletter.pdfFile.data.toString('base64');
      }
      
      return res.status(200).json({
        success: true,
        message: "Newsletter updated successfully",
        newsletter: responseNewsletter
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Newsletter deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};