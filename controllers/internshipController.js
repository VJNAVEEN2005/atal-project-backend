const Internship = require('../models/internshipModal');

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

// Get all internships
exports.getAllInternships = async (req, res) => {
    try {
        const internships = await Internship.find();

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
