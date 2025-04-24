const tenderModel = require('../models/tenderModel');

exports.createTender = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Create a new tender with file data
        const newTender = new tenderModel({
            title: req.body.title,
            date: req.body.date,
            organization: req.body.organization,
            reference: req.body.reference || `TN-${Date.now().toString().slice(-6)}`,
            lastDate: req.body.lastDate,
            lastTime: req.body.lastTime,
            fileName: req.file.originalname,
            fileData: req.file.buffer,
            fileContentType: req.file.mimetype
        });

        await newTender.save();
        
        // Return success response without sending back the large file data
        const responseTender = {
            _id: newTender._id,
            title: newTender.title,
            date: newTender.date,
            organization: newTender.organization,
            reference: newTender.reference,
            lastDate: newTender.lastDate,
            lastTime: newTender.lastTime,
            fileName: newTender.fileName,
            createdAt: newTender.createdAt
        };

        return res.status(201).json({ 
            success: true, 
            message: "Tender created successfully", 
            tender: responseTender 
        });

    } catch (error) {
        console.error("Error creating tender:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTenders = async (req, res) => {
    try {
        // Get all tenders without returning the file data
        const tenders = await tenderModel.find({}).select('-fileData').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: "Tenders fetched successfully", tenders });
    } catch (error) {
        console.error("Error fetching tenders:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.downloadTender = async (req, res) => {
    try {
        const tenderId = req.params.id;
        
        // Find the tender document
        const tender = await tenderModel.findById(tenderId);
        
        if (!tender) {
            return res.status(404).json({ success: false, message: "Tender not found" });
        }
        
        // Set response headers
        res.set({
            'Content-Type': tender.fileContentType,
            'Content-Disposition': `attachment; filename="${tender.fileName}"`,
            'Content-Length': tender.fileData.length
        });
        
        // Send the file
        return res.send(tender.fileData);
        
    } catch (error) {
        console.error("Error downloading tender:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTender = async (req, res) => {
    try {
        const tenderId = req.params.id;
        
        const deletedTender = await tenderModel.findByIdAndDelete(tenderId);
        
        if (!deletedTender) {
            return res.status(404).json({ success: false, message: "Tender not found" });
        }
        
        return res.status(200).json({ success: true, message: "Tender deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting tender:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};