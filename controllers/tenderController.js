const tenderModel = require('../models/tenderModel');
const { 
  uploadFileStream, 
  getFileStream, 
  deleteFile,
  getFileInfo,
  bufferToStream
} = require('../utils/gridfs');

exports.createTender = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Create upload stream
        const uploadStream = uploadFileStream(req.file.originalname, {
            contentType: req.file.mimetype,
            metadata: {
                uploadedBy: req.user?.id || 'system',
                originalName: req.file.originalname
            }
        });

        // Pipe the file buffer to GridFS
        const bufferStream = bufferToStream(req.file.buffer);
        bufferStream.pipe(uploadStream);

        // Wait for upload to complete
        const fileId = await new Promise((resolve, reject) => {
            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.on('error', reject);
        });

        // Create tender document
        const newTender = new tenderModel({
            title: req.body.title,
            date: req.body.date,
            organization: req.body.organization,
            reference: req.body.reference || `TN-${Date.now().toString().slice(-6)}`,
            lastDate: req.body.lastDate,
            lastTime: req.body.lastTime,
            fileName: req.file.originalname,
            fileId: fileId,
            fileContentType: req.file.mimetype,
            fileSize: req.file.size
        });

        await newTender.save();
        
        const responseTender = {
            _id: newTender._id,
            title: newTender.title,
            date: newTender.date,
            organization: newTender.organization,
            reference: newTender.reference,
            lastDate: newTender.lastDate,
            lastTime: newTender.lastTime,
            fileName: newTender.fileName,
            fileSize: newTender.fileSize,
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
        const tenders = await tenderModel.find({})
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain JS objects
            
        // Add file info if needed
        const tendersWithFileInfo = await Promise.all(
            tenders.map(async tender => {
                if (tender.fileId) {
                    const fileInfo = await getFileInfo(tender.fileId);
                    return {
                        ...tender,
                        fileSize: fileInfo?.length || tender.fileSize,
                        uploadDate: fileInfo?.uploadDate
                    };
                }
                return tender;
            })
        );
        
        return res.status(200).json({ 
            success: true, 
            message: "Tenders fetched successfully", 
            tenders: tendersWithFileInfo 
        });
    } catch (error) {
        console.error("Error fetching tenders:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.downloadTender = async (req, res) => {
    try {
        const tenderId = req.params.id;
        const tender = await tenderModel.findById(tenderId);
        
        if (!tender) {
            return res.status(404).json({ success: false, message: "Tender not found" });
        }

        if (!tender.fileId) {
            return res.status(404).json({ 
                success: false, 
                message: "File not available for this tender" 
            });
        }

        // Get file info for proper headers
        const fileInfo = await getFileInfo(tender.fileId);
        
        res.set({
            'Content-Type': tender.fileContentType || 'application/pdf',
            'Content-Disposition': `attachment; filename="${tender.fileName}"`,
            'Content-Length': fileInfo?.length || tender.fileSize
        });

        const readStream = getFileStream(tender.fileId);
        
        // Proper error handling for the stream
        readStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Error streaming file' 
                });
            }
        });
        
        readStream.pipe(res);
        
    } catch (error) {
        console.error("Error downloading tender:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.deleteTender = async (req, res) => {
    try {
        const tenderId = req.params.id;
        const tender = await tenderModel.findById(tenderId);
        
        if (!tender) {
            return res.status(404).json({ success: false, message: "Tender not found" });
        }

        if (tender.fileId) {
            await deleteFile(tender.fileId);
        }

        await tenderModel.findByIdAndDelete(tenderId);
        
        return res.status(200).json({ success: true, message: "Tender deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting tender:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};