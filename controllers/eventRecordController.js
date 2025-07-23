const EventRecord = require('../models/eventRecordModel');

// @desc    Create a new event record
// @route   POST /api/v1/events/registrations
// @access  Private/Admin
exports.createEventRecord = async (req, res, next) => {
  try {
  const { name, email, phone, eventName, amountPaid, dateOfRegistration } = req.body;

  const eventRecord = await EventRecord.create({
    name,
    email,
    phone,
    eventName,
    amountPaid,
    dateOfRegistration: dateOfRegistration || Date.now()
  });

    res.status(201).json({
      status: 'success',
      data: {
        eventRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event record
// @route   PUT /api/v1/events/registrations/:id
// @access  Private/Admin
exports.updateEventRecord = async (req, res, next) => {
  try {
    const { name, email, phone, eventName, amountPaid, dateOfRegistration } = req.body;

    const eventRecord = await EventRecord.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        eventName,
        amountPaid,
        dateOfRegistration,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!eventRecord) {
      return res.status(404).json({ success: false, message: 'No event record found with that ID' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        eventRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all event records
// @route   GET /api/v1/events/registrations
// @access  Private/Admin
exports.getAllEventRecords = async (req, res, next) => {
  try {
    const eventRecords = await EventRecord.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: eventRecords.length,
      data: {
        eventRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event record
// @route   GET /api/v1/events/registrations/:id
// @access  Private/Admin
exports.getEventRecord = async (req, res, next) => {
  try {
    const eventRecord = await EventRecord.findById(req.params.id);

    if (!eventRecord) {
      return res.status(404).json({ success: false, message: 'No event record found with that ID' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        eventRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event record
// @route   DELETE /api/v1/events/registrations/:id
// @access  Private/Admin
exports.deleteEventRecord = async (req, res, next) => {
  try {
    const eventRecord = await EventRecord.findByIdAndDelete(req.params.id);

    if (!eventRecord) {
      return res.status(404).json({ success: false, message: 'No event record found with that ID' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
