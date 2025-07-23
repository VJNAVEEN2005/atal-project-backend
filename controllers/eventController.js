const Event = require('../models/eventModel');
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
const uploadPoster = upload.single('poster');

exports.createEvent = async (req, res) => {
  try {
    // Use multer to handle file upload
    uploadPoster(req, res, async function(err) {
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
      const eventData = { ...req.body };
      
      if (req.file) {
        eventData.poster = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      // Create the event with or without poster
      const newEvent = await Event.create(eventData);
      
      // Convert buffer to base64 for front-end display
      const responseEvent = newEvent.toObject();
      if (responseEvent.poster && responseEvent.poster.data) {
        responseEvent.poster.data = responseEvent.poster.data.toString('base64');
      }
      
      return res.status(201).json({ 
        success: true, 
        message: "Event created successfully", 
        event: responseEvent 
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    
    // Convert all buffer data to base64
    const eventsWithBase64 = events.map(event => {
      const eventObj = event.toObject();
      if (eventObj.poster && eventObj.poster.data) {
        eventObj.poster.data = eventObj.poster.data.toString('base64');
      }
      return eventObj;
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Events fetched successfully", 
      events: eventsWithBase64
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }
    
    // Convert buffer to base64
    const eventObj = event.toObject();
    if (eventObj.poster && eventObj.poster.data) {
      eventObj.poster.data = eventObj.poster.data.toString('base64');
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Event fetched successfully", 
      event: eventObj
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    uploadPoster(req, res, async function(err) {
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
      
      // Get existing event
      const existingEvent = await Event.findById(req.params.id);
      
      if (!existingEvent) {
        return res.status(404).json({ 
          success: false, 
          message: "Event not found" 
        });
      }
      
      // Prepare update data
      const updateData = { ...req.body };
      
      // Update poster if a new file was uploaded
      if (req.file) {
        updateData.poster = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
      
      // Update the event
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Convert buffer to base64 for response
      const responseEvent = updatedEvent.toObject();
      if (responseEvent.poster && responseEvent.poster.data) {
        responseEvent.poster.data = responseEvent.poster.data.toString('base64');
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Event updated successfully", 
        event: responseEvent
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//Add event api for getting upcomming events(filtering)
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).select('-poster');
    
    // Convert all buffer data to base64
    const eventsWithBase64 = events.map(event => {
      const eventObj = event.toObject();
      if (eventObj.poster && eventObj.poster.data) {
        eventObj.poster.data = eventObj.poster.data.toString('base64');
      }
      return eventObj;
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Upcoming events fetched successfully", 
      events: eventsWithBase64
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};