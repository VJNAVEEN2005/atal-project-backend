const EventRecord = require('../models/eventRecordModel');
// @desc    Update event data for all records by event name
// @route   PUT /api/v1/events/update-by-eventname/:eventName
// @access  Private/Admin
exports.updateEventByEventName = async (req, res, next) => {
  try {
    const { eventName } = req.params;
    const updateFields = {};
    // Only allow updating eventName and eventDate for all records with this eventName
    if (req.body.eventName) updateFields.eventName = req.body.eventName;
    if (req.body.eventDate) updateFields.eventDate = new Date(req.body.eventDate);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No valid fields provided to update.'
      });
    }

    const result = await EventRecord.updateMany(
      { eventName: { $regex: `^${eventName}$`, $options: 'i' } },
      { $set: updateFields }
    );

    res.status(200).json({
      status: 'success',
      message: `Updated ${result.modifiedCount} records for event: ${eventName}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event record
// @route   POST /api/v1/events/registrations
// @access  Private/Admin
exports.createEventRecord = async (req, res, next) => {
  try {
    const { name, email, phone, eventName, amountPaid, dateOfRegistration } = req.body;

    // Validate and parse amountPaid
    const parsedAmount = parseFloat(amountPaid);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid amount paid. Must be a valid number greater than or equal to 0.'
      });
    }

    // Parse dateOfRegistration if provided
    let registrationDate;
    if (dateOfRegistration) {
      registrationDate = new Date(dateOfRegistration);
      if (isNaN(registrationDate.getTime())) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid date format for dateOfRegistration.'
        });
      }
    } else {
      registrationDate = new Date();
    }

    const eventRecord = await EventRecord.create({
      name: name?.trim(),
      email: email?.trim()?.toLowerCase(),
      phone: phone?.trim(),
      eventName: eventName?.trim(),
      amountPaid: parsedAmount,
      dateOfRegistration: registrationDate
    });

    res.status(201).json({
      status: 'success',
      data: {
        eventRecord
      }
    });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'This person is already registered for this event.',
        error: 'Duplicate registration'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: errors
      });
    }

    console.error('Event record creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating event record'
    });
  }
};

// @desc    Bulk import event records
// @route   POST /api/v1/events/registrations/bulk
// @access  Private/Admin
exports.bulkCreateEventRecords = async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Records array is required and must not be empty'
      });
    }

    const processedRecords = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // Validate and parse amountPaid
        const parsedAmount = parseFloat(record.amountPaid);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          errors.push({
            index: i,
            record: record,
            error: 'Invalid amount paid'
          });
          continue;
        }

        // Parse dateOfRegistration if provided
        let registrationDate;
        if (record.dateOfRegistration) {
          registrationDate = new Date(record.dateOfRegistration);
          if (isNaN(registrationDate.getTime())) {
            errors.push({
              index: i,
              record: record,
              error: 'Invalid date format'
            });
            continue;
          }
        } else {
          registrationDate = new Date();
        }

        const processedRecord = {
          name: record.name?.trim(),
          email: record.email?.trim()?.toLowerCase(),
          phone: record.phone?.trim(),
          eventName: record.eventName?.trim(),
          amountPaid: parsedAmount,
          dateOfRegistration: registrationDate
        };

        processedRecords.push(processedRecord);
      } catch (error) {
        errors.push({
          index: i,
          record: record,
          error: error.message
        });
      }
    }

    // Insert all valid records
    let createdRecords = [];
    if (processedRecords.length > 0) {
      try {
        createdRecords = await EventRecord.insertMany(processedRecords, { ordered: false });
      } catch (bulkError) {
        // Handle duplicate key errors in bulk insert
        if (bulkError.writeErrors) {
          bulkError.writeErrors.forEach(writeError => {
            errors.push({
              index: writeError.index,
              record: processedRecords[writeError.index],
              error: writeError.code === 11000 ? 'Duplicate registration' : writeError.errmsg
            });
          });
          // Get successfully inserted records
          createdRecords = bulkError.insertedDocs || [];
        } else {
          throw bulkError;
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        totalProcessed: records.length,
        successfulInserts: createdRecords.length,
        errors: errors.length,
        createdRecords: createdRecords,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Bulk event record creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during bulk import'
    });
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

// @desc    Get event summary grouped by event name
// @route   GET /api/v1/events/summary
// @access  Private/Admin
exports.getEventSummary = async (req, res, next) => {
  try {
    const eventSummary = await EventRecord.aggregate([
      {
        $group: {
          _id: "$eventName",
          totalMembers: { $sum: 1 },
          totalAmountPaid: { $sum: { $toDouble: "$amountPaid" } },
          eventDate: { $first: "$eventDate" },
          registrations: {
            $push: {
              name: "$name",
              email: "$email",
              phone: "$phone",
              amountPaid: "$amountPaid",
              dateOfRegistration: "$dateOfRegistration"
            }
          }
        }
      },
      {
        $project: {
          eventName: "$_id",
          totalMembers: 1,
          totalAmountPaid: 1,
          eventDate: 1,
          avgAmountPerMember: { $divide: ["$totalAmountPaid", "$totalMembers"] },
          registrations: 1,
          _id: 0
        }
      },
      {
        $sort: { eventDate: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: eventSummary.length,
      data: {
        eventSummary
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event summary for a specific event
// @route   GET /api/v1/events/summary/:eventName
// @access  Private/Admin
exports.getSpecificEventSummary = async (req, res, next) => {
  try {
    const { eventName } = req.params;
    
    const eventSummary = await EventRecord.aggregate([
      {
        $match: { eventName: { $regex: eventName, $options: 'i' } }
      },
      {
        $group: {
          _id: "$eventName",
          totalMembers: { $sum: 1 },
          totalAmountPaid: { $sum: { $toDouble: "$amountPaid" } },
          eventDate: { $first: "$eventDate" },
          earliestRegistration: { $min: "$createdAt" },
          latestRegistration: { $max: "$createdAt" },
          registrations: {
            $push: {
              id: "$_id",
              name: "$name",
              email: "$email",
              phone: "$phone",
              amountPaid: "$amountPaid",
              dateOfRegistration: "$dateOfRegistration",
              createdAt: "$createdAt",
              eventName: "$eventName"
            }
          }
        }
      },
      {
        $project: {
          eventName: "$_id",
          totalMembers: 1,
          totalAmountPaid: 1,
          eventDate: 1,
          earliestRegistration: 1,
          latestRegistration: 1,
          avgAmountPerMember: { $divide: ["$totalAmountPaid", "$totalMembers"] },
          registrations: {
            $sortArray: {
              input: "$registrations",
              sortBy: { createdAt: -1 }
            }
          },
          _id: 0
        }
      }
    ]);

    if (eventSummary.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No registrations found for event: ${eventName}` 
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        eventSummary: eventSummary[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events overview with basic stats
// @route   GET /api/v1/events/overview
// @access  Private/Admin
exports.getEventsOverview = async (req, res, next) => {
  try {
    const overview = await EventRecord.aggregate([
      {
        $group: {
          _id: "$eventName",
          totalMembers: { $sum: 1 },
          totalAmountPaid: { $sum: { $toDouble: "$amountPaid" } },
          eventDate: { $first: "$dateOfRegistration" }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalRegistrations: { $sum: "$totalMembers" },
          totalRevenue: { $sum: "$totalAmountPaid" },
          events: {
            $push: {
              eventName: "$_id",
              totalMembers: "$totalMembers",
              totalAmountPaid: "$totalAmountPaid",
              eventDate: "$eventDate"
            }
          }
        }
      },
      {
        $project: {
          totalEvents: 1,
          totalRegistrations: 1,
          totalRevenue: 1,
          avgRevenuePerEvent: { $divide: ["$totalRevenue", "$totalEvents"] },
          avgMembersPerEvent: { $divide: ["$totalRegistrations", "$totalEvents"] },
          events: {
            $sortArray: {
              input: "$events",
              sortBy: { eventDate: -1 }
            }
          },
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: overview[0] || {
          totalEvents: 0,
          totalRegistrations: 0,
          totalRevenue: 0,
          avgRevenuePerEvent: 0,
          avgMembersPerEvent: 0,
          events: []
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
