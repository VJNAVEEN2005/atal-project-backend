const EventRecord = require('../models/eventRecordModel');
const XLSX = require('xlsx');
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

// @desc    Get all event records with pagination
// @route   GET /api/v1/events/registrations
// @access  Private/Admin
exports.getAllEventRecords = async (req, res, next) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract optional filter parameters
    const { eventName, search, dateFrom, dateTo } = req.query;
    
    // Build filter object
    let filter = {};
    if (eventName) {
      filter.eventName = { $regex: eventName, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { eventName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateOfRegistration = {};
      if (dateFrom) {
        filter.dateOfRegistration.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.dateOfRegistration.$lte = new Date(dateTo);
      }
    }
    
    // Get total count for pagination info
    const totalEventRecords = await EventRecord.countDocuments(filter);
    const totalPages = Math.ceil(totalEventRecords / limit);
    
    // Get event records with pagination
    const eventRecords = await EventRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: eventRecords.length,
      data: {
        eventRecords
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEventRecords: totalEventRecords,
        eventRecordsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
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

// @desc    Get event summary grouped by event name with pagination
// @route   GET /api/v1/events/summary
// @access  Private/Admin
exports.getEventSummary = async (req, res, next) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract optional filter parameters
    const { search, dateFrom, dateTo } = req.query;
    
    // Build match stage for filtering
    let matchStage = {};
    if (search) {
      matchStage.eventName = { $regex: search, $options: 'i' };
    }
    if (dateFrom || dateTo) {
      matchStage.dateOfRegistration = {};
      if (dateFrom) {
        matchStage.dateOfRegistration.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        matchStage.dateOfRegistration.$lte = new Date(dateTo);
      }
    }

    // First get the total count of unique events for pagination
    const totalEventsCount = await EventRecord.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: "$eventName"
        }
      },
      {
        $count: "totalEvents"
      }
    ]);

    const totalEvents = totalEventsCount.length > 0 ? totalEventsCount[0].totalEvents : 0;
    const totalPages = Math.ceil(totalEvents / limit);

    // Get paginated event summary
    const eventSummary = await EventRecord.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
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
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: eventSummary.length,
      data: {
        eventSummary
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEvents: totalEvents,
        eventsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event summary for a specific event with pagination for registrations
// @route   GET /api/v1/events/summary/:eventName
// @access  Private/Admin
exports.getSpecificEventSummary = async (req, res, next) => {
  try {
    const { eventName } = req.params;
    
    // Extract pagination parameters from query (for registrations within the event)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract optional filter parameters for registrations
    const { search, dateFrom, dateTo } = req.query;
    
    // Build filter object for registrations
    let registrationFilter = { eventName: { $regex: eventName, $options: 'i' } };
    if (search) {
      registrationFilter.$and = [
        { eventName: { $regex: eventName, $options: 'i' } },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }
    if (dateFrom || dateTo) {
      registrationFilter.dateOfRegistration = {};
      if (dateFrom) {
        registrationFilter.dateOfRegistration.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        registrationFilter.dateOfRegistration.$lte = new Date(dateTo);
      }
    }

    // Get total registrations count for this event (for pagination)
    const totalRegistrations = await EventRecord.countDocuments(registrationFilter);
    const totalPages = Math.ceil(totalRegistrations / limit);

    // Get basic event summary (not paginated)
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
          latestRegistration: { $max: "$createdAt" }
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

    // Get paginated registrations for this event
    const registrations = await EventRecord.find(registrationFilter)
      .select('name email phone amountPaid dateOfRegistration createdAt eventName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const result = {
      ...eventSummary[0],
      registrations: registrations
    };

    res.status(200).json({
      status: 'success',
      data: {
        eventSummary: result
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRegistrations: totalRegistrations,
        registrationsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events overview with basic stats and pagination
// @route   GET /api/v1/events/overview
// @access  Private/Admin
exports.getEventsOverview = async (req, res, next) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract optional filter parameters
    const { search, dateFrom, dateTo } = req.query;
    
    // Build match stage for filtering
    let matchStage = {};
    if (search) {
      matchStage.eventName = { $regex: search, $options: 'i' };
    }
    if (dateFrom || dateTo) {
      matchStage.dateOfRegistration = {};
      if (dateFrom) {
        matchStage.dateOfRegistration.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        matchStage.dateOfRegistration.$lte = new Date(dateTo);
      }
    }

    // Get overall totals (not paginated)
    const overallTotals = await EventRecord.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
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
          totalRevenue: { $sum: "$totalAmountPaid" }
        }
      }
    ]);

    const totals = overallTotals[0] || {
      totalEvents: 0,
      totalRegistrations: 0,
      totalRevenue: 0
    };

    const totalPages = Math.ceil(totals.totalEvents / limit);

    // Get paginated events list
    const paginatedEvents = await EventRecord.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: "$eventName",
          totalMembers: { $sum: 1 },
          totalAmountPaid: { $sum: { $toDouble: "$amountPaid" } },
          eventDate: { $first: "$dateOfRegistration" }
        }
      },
      {
        $project: {
          eventName: "$_id",
          totalMembers: "$totalMembers",
          totalAmountPaid: "$totalAmountPaid",
          eventDate: "$eventDate",
          _id: 0
        }
      },
      {
        $sort: { eventDate: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalEvents: totals.totalEvents,
          totalRegistrations: totals.totalRegistrations,
          totalRevenue: totals.totalRevenue,
          avgRevenuePerEvent: totals.totalEvents > 0 ? totals.totalRevenue / totals.totalEvents : 0,
          avgMembersPerEvent: totals.totalEvents > 0 ? totals.totalRegistrations / totals.totalEvents : 0,
          events: paginatedEvents
        }
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEvents: totals.totalEvents,
        eventsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export event records to Excel
// @route   GET /api/v1/events/registrations/export-excel
// @access  Private/Admin
exports.exportEventRecordsToExcel = async (req, res, next) => {
  try {
    // Get all event records
    const eventRecords = await EventRecord.find().sort({ createdAt: -1 });

    if (eventRecords.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event records found to export'
      });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Get unique event names for creating separate sheets
    const eventNames = [...new Set(eventRecords.map(record => record.eventName))];

    // Create main summary sheet
    const summaryData = [];
    let totalRevenue = 0;
    let totalRegistrations = eventRecords.length;

    eventNames.forEach(eventName => {
      const eventFilteredRecords = eventRecords.filter(record => record.eventName === eventName);
      const eventRevenue = eventFilteredRecords.reduce((sum, record) => sum + (record.amountPaid || 0), 0);
      totalRevenue += eventRevenue;
      
      summaryData.push({
        'Event Name': eventName,
        'Total Registrations': eventFilteredRecords.length,
        'Total Revenue': eventRevenue,
        'Average Revenue per Registration': eventFilteredRecords.length > 0 ? (eventRevenue / eventFilteredRecords.length).toFixed(2) : 0
      });
    });

    // Add overall summary at the end
    summaryData.push({
      'Event Name': 'TOTAL SUMMARY',
      'Total Registrations': totalRegistrations,
      'Total Revenue': totalRevenue,
      'Average Revenue per Registration': totalRegistrations > 0 ? (totalRevenue / totalRegistrations).toFixed(2) : 0
    });

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Create main data sheet with all event records
    const mainData = eventRecords.map((record, index) => ({
      'S.No': index + 1,
      'Name': record.name || '',
      'Email': record.email || '',
      'Phone': record.phone || '',
      'Event Name': record.eventName || '',
      'Amount Paid': record.amountPaid || 0,
      'Registration Date': record.dateOfRegistration ? new Date(record.dateOfRegistration).toLocaleDateString('en-IN') : '',
      'Created At': record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN') : ''
    }));

    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'All Event Records');

    // Create individual sheets for each event (only if there are multiple events)
    if (eventNames.length > 1) {
      eventNames.forEach(eventName => {
        const eventRecordsData = eventRecords
          .filter(record => record.eventName === eventName)
          .map((record, index) => ({
            'S.No': index + 1,
            'Name': record.name || '',
            'Email': record.email || '',
            'Phone': record.phone || '',
            'Amount Paid': record.amountPaid || 0,
            'Registration Date': record.dateOfRegistration ? new Date(record.dateOfRegistration).toLocaleDateString('en-IN') : '',
            'Created At': record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN') : ''
          }));

        if (eventRecordsData.length > 0) {
          const eventWorksheet = XLSX.utils.json_to_sheet(eventRecordsData);
          // Sanitize sheet name (Excel sheet names can't contain certain characters)
          const sanitizedEventName = eventName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
          XLSX.utils.book_append_sheet(workbook, eventWorksheet, sanitizedEventName);
        }
      });
    }

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers for file download
    const filename = `event_records_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the Excel file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error exporting event records to Excel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export event records to Excel',
      error: error.message
    });
  }
};
