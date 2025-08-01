const Internship = require('../models/internshipModal');
const XLSX = require('xlsx');

// Create a new internship
exports.createInternship = async (req, res) => {
    try {
        const internshipData = req.body;
        console.log('Creating internship with data:', internshipData);
        // Create the internship entry
        const newInternship = await Internship.create(internshipData);

        return res.status(201).json({
            success: true,
            message: 'Internship created successfully',
            data: newInternship
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// update an existing internship
exports.updateInternship = async (req, res) => {
    try {
        const { internshipId } = req.params;
        console.log(`Updating internship with ID: ${internshipId}`);
        const updatedData = req.body;

        // Find and update the internship
        const updatedInternship = await Internship.findByIdAndUpdate(
            internshipId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedInternship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Internship updated successfully',
            data: updatedInternship
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all internships with pagination
exports.getAllInternships = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Extract optional filter parameters
        const { status, designation, bloodGroup, maritalStatus, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (designation) {
            filter.designation = designation;
        }
        if (bloodGroup) {
            filter.bloodGroup = bloodGroup;
        }
        if (maritalStatus) {
            filter.maritalStatus = maritalStatus;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { emailId: { $regex: search, $options: 'i' } },
                { internNo: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total count for pagination info
        const totalInternships = await Internship.countDocuments(filter);
        const totalPages = Math.ceil(totalInternships / limit);
        
        // Get internships with pagination
        const internships = await Internship.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: internships,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalInternships: totalInternships,
                internshipsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get a single internship by ID
exports.getInternshipById = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete an internship
exports.deleteInternship = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const deletedInternship = await Internship.findByIdAndDelete(internshipId);
        if (!deletedInternship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Internship deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get internships by user ID
exports.getInternshipsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const internships = await Internship.find({ userId: userId });

        if (internships.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No internships found for this user'
            });
        }

        return res.status(200).json({
            success: true,
            data: internships
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get internships by emailId
exports.getInternshipsByEmailId = async (req, res) => {
    try {
        const { emailId } = req.params;
        const internships = await Internship.find({ emailId: emailId });

        if (internships.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No internships found for this emailId'
            });
        }

        return res.status(200).json({
            success: true,
            data: internships
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all internships data to Excel
exports.exportInternshipsToExcel = async (req, res) => {
    try {
        // Extract optional filter parameters
        const { status, designation, bloodGroup, maritalStatus, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (designation) {
            filter.designation = designation;
        }
        if (bloodGroup) {
            filter.bloodGroup = bloodGroup;
        }
        if (maritalStatus) {
            filter.maritalStatus = maritalStatus;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { emailId: { $regex: search, $options: 'i' } },
                { internNo: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all internships (no pagination for export)
        const internships = await Internship.find(filter).sort({ createdAt: -1 });
        
        if (internships.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No internships found to export'
            });
        }
        
        // Prepare data for Excel export
        const excelData = internships.map((internship, index) => {
            const obj = internship.toObject();
            
            return {
                'S.No': index + 1,
                'Internship ID': obj._id.toString(),
                'Intern Number': obj.internNo || '',
                'Name': obj.name || '',
                'Date of Birth': obj.dateOfBirth || '',
                'Email ID': obj.emailId || '',
                'Phone Number': obj.phoneNumber || '',
                'Father Name': obj.fatherName || '',
                'Mother Name': obj.motherName || '',
                'Blood Group': obj.bloodGroup || '',
                'Permanent Address': obj.permanentAddress || '',
                'Communication Address': obj.communicationAddress || '',
                'Date of Expiry': obj.dateOfExpiry || '',
                'Marital Status': obj.maritalStatus || '',
                'Date of Joining': obj.dateOfJoining || '',
                'Designation': obj.designation || '',
                'Status': obj.status || '',
                'Created Date': obj.createdAt ? new Date(obj.createdAt).toLocaleString() : '',
                'Updated Date': obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : ''
            };
        });
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths for better readability
        const columnWidths = [
            { wch: 8 },   // S.No
            { wch: 25 },  // Internship ID
            { wch: 15 },  // Intern Number
            { wch: 20 },  // Name
            { wch: 15 },  // Date of Birth
            { wch: 25 },  // Email ID
            { wch: 15 },  // Phone Number
            { wch: 20 },  // Father Name
            { wch: 20 },  // Mother Name
            { wch: 12 },  // Blood Group
            { wch: 30 },  // Permanent Address
            { wch: 30 },  // Communication Address
            { wch: 15 },  // Date of Expiry
            { wch: 15 },  // Marital Status
            { wch: 15 },  // Date of Joining
            { wch: 20 },  // Designation
            { wch: 10 },  // Status
            { wch: 20 },  // Created Date
            { wch: 20 }   // Updated Date
        ];
        worksheet['!cols'] = columnWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Internships');
        
        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx' 
        });
        
        // Set response headers for file download
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `internships_export_${timestamp}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file
        return res.send(excelBuffer);
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error exporting internships to Excel: ' + error.message
        });
    }
};
