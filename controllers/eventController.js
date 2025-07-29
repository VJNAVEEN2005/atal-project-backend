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

exports.getEventDates = async (req, res) => {
  try {
    const events = await Event.find({}, { date: 1 });
    const dates = [...new Set(events.map(event => 
      event.date.toISOString().split('T')[0]
    ))];
    
    return res.status(200).json({
      success: true,
      message: "Event dates fetched successfully",
      dates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get paginated events
// Update getEventsPaged to support date filtering
exports.getEventsPaged = async (req, res) => {
  try {
    let { page = 1, limit = 10, dates } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    
    // Handle multiple date filtering
    if (dates) {
      const dateArray = dates.split(',');
      const dateConditions = dateArray.map(dateStr => {
        const start = new Date(dateStr);
        const end = new Date(dateStr);
        end.setDate(end.getDate() + 1);
        return {
          date: {
            $gte: start,
            $lt: end
          }
        };
      });
      filter.$or = dateConditions;
    }

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const eventsWithBase64 = events.map(event => {
      const eventObj = event.toObject();
      if (eventObj.poster?.data) {
        eventObj.poster.data = eventObj.poster.data.toString('base64');
      }
      return eventObj;
    });

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      events: eventsWithBase64,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get event summary (count per year/month)
exports.getEventSummary = async (req, res) => {
  try {
    // Group by year and month
    const summary = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ]);

    // Format summary for frontend
    const formatted = {};
    summary.forEach(item => {
      const { year, month } = item._id;
      if (!formatted[year]) formatted[year] = {};
      formatted[year][month] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: "Event summary fetched successfully",
      summary: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create event with file upload
exports.createEvent = async (req, res) => {
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

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: -1 });
    
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

// Get single event
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

// Update event
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

// Delete event
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

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: -1 }).select('-poster');
    
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