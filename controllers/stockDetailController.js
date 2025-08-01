const StockDetail = require('../models/stockDetailModel');
const mongoose = require('mongoose');  // Add this line at the top
const UpdateStockRecords = require('../models/updateStockRecordsModel');
const XLSX = require('xlsx');
// post a new stock detail with image upload

exports.createStockDetail = async (req, res) => {
    try {
        const stockData = {
            stockId: req.body.stockId,
            stockName: req.body.stockName,
            count: req.body.count || 0,
            stockType: req.body.stockType
        };

        if (req.file) {
            stockData.stockImage = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname
            };
        }

        const stockDetail = await StockDetail.create(stockData);

        res.status(201).json({
            status: 'success',
            data: stockDetail
        });
    } catch (err) {
        console.error('Error creating stock detail:', err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}


// update stock image by geting the image and coverting it to buffer
exports.updateStockImage = async (req, res) => {
    try {
        const stockDetail = await StockDetail.findByIdAndUpdate(
            req.params.id,
            {
                stockImage: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            },
            { new: true, runValidators: true }
        );

        if (!stockDetail) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock detail not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: stockDetail
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}

// Get all stock details with pagination
exports.getAllStockDetails = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Extract optional filter parameters
        const { stockType, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (stockType) {
            filter.stockType = stockType;
        }
        if (search) {
            filter.$or = [
                { stockName: { $regex: search, $options: 'i' } },
                { stockId: { $regex: search, $options: 'i' } },
                { stockType: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total count for pagination info
        const totalStockDetails = await StockDetail.countDocuments(filter);
        const totalPages = Math.ceil(totalStockDetails / limit);
        
        // Get stock details with pagination
        const stockDetails = await StockDetail.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: 'success',
            data: stockDetails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalStockDetails: totalStockDetails,
                stockDetailsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}


// Get stock detail by ID
exports.getStockDetailById = async (req, res) => {
    try {
        const stockDetail = await StockDetail.findById(req.params.id);
        if (!stockDetail) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock detail not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: stockDetail
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}

// display stock image alone by ID to give as url
exports.getStockImage = async (req, res) => {
    try {
        // Validate the ID parameter
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send(`
                <html>
                    <body>
                        <h1>Invalid ID</h1>
                        <p>The provided image ID is not valid.</p>
                    </body>
                </html>
            `);
        }

        const stockDetail = await StockDetail.findById(req.params.id)
            .select('stockImage');

        if (!stockDetail || !stockDetail.stockImage || !stockDetail.stockImage.data) {
            return res.status(404).send(`
                <html>
                    <body>
                        <h1>Image Not Found</h1>
                        <p>The requested stock image does not exist.</p>
                    </body>
                </html>
            `);
        }

        res.set({
            'Content-Type': stockDetail.stockImage.contentType,
            'Content-Length': stockDetail.stockImage.data.length,
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
            'Content-Disposition': `inline; filename="${stockDetail.stockImage.fileName || 'stock-image'}"`
        });

        res.send(stockDetail.stockImage.data);
    } catch (err) {
        console.error('Error fetching stock image:', err);

        // Escape HTML in error message to prevent XSS
        const escapedMessage = err.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        res.status(500).send(`
            <html>
                <body>
                    <h1>Error Loading Image</h1>
                    <p>${escapedMessage}</p>
                </body>
            </html>
        `);
    }
}



// delete stock detail by ID
exports.deleteStockDetail = async (req, res) => {
    try {
        const stockDetailFind = await StockDetail.findById(req.params.id);
        if (!stockDetailFind) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock detail not found'
            });
        }
        // Check if the stock has any associated update records if there delete that too
        const updateRecords = await UpdateStockRecords.find({ stockId: stockDetailFind.stockId });
        if (updateRecords.length > 0) {
            await UpdateStockRecords.deleteMany({ stockId: stockDetailFind.stockId });
        }

        const stockDetail = await StockDetail.findByIdAndDelete(req.params.id);
        if (!stockDetail) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock detail not found'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}

// Export all stock details data to Excel with separate sheets for update records
exports.exportStockDetailsToExcel = async (req, res) => {
    try {
        // Extract optional filter parameters
        const { stockType, search } = req.query;
        
        // Build filter object
        let filter = {};
        if (stockType) {
            filter.stockType = stockType;
        }
        if (search) {
            filter.$or = [
                { stockName: { $regex: search, $options: 'i' } },
                { stockId: { $regex: search, $options: 'i' } },
                { stockType: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all stock details (no pagination for export)
        const stockDetails = await StockDetail.find(filter).sort({ createdAt: -1 });
        
        if (stockDetails.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No stock details found to export'
            });
        }
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Prepare main stock details data for Excel export
        const stockDetailsData = stockDetails.map((stockDetail, index) => {
            const obj = stockDetail.toObject();
            
            return {
                'S.No': index + 1,
                'Stock ID': obj.stockId || '',
                'Stock Name': obj.stockName || '',
                'Count': obj.count || 0,
                'Stock Type': obj.stockType || '',
                'Has Image': obj.stockImage && obj.stockImage.data ? 'Yes' : 'No',
                'Created Date': obj.createdAt ? new Date(obj.createdAt).toLocaleString() : '',
                'Updated Date': obj.updatedAt ? new Date(obj.updatedAt).toLocaleString() : ''
            };
        });
        
        // Create main stock details worksheet
        const stockDetailsWorksheet = XLSX.utils.json_to_sheet(stockDetailsData);
        
        // Set column widths for stock details sheet
        const stockDetailsColumnWidths = [
            { wch: 8 },   // S.No
            { wch: 15 },  // Stock ID
            { wch: 25 },  // Stock Name
            { wch: 10 },  // Count
            { wch: 15 },  // Stock Type
            { wch: 12 },  // Has Image
            { wch: 20 },  // Created Date
            { wch: 20 }   // Updated Date
        ];
        stockDetailsWorksheet['!cols'] = stockDetailsColumnWidths;
        
        // Add main stock details worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, stockDetailsWorksheet, 'Stock Details');
        
        // Create separate sheets for each stock item's update records
        for (let stockDetail of stockDetails) {
            // Get update records for this stock ID
            const updateRecords = await UpdateStockRecords.find({ stockId: stockDetail.stockId })
                .sort({ dateUpdated: -1 });
            
            if (updateRecords.length > 0) {
                // Prepare update records data
                const updateRecordsData = updateRecords.map((record, index) => {
                    const obj = record.toObject();
                    
                    return {
                        'S.No': index + 1,
                        'Stock ID': obj.stockId || '',
                        'Count Changed': obj.countChanged || 0,
                        'User ID': obj.userId || '',
                        'User Name': obj.userName || '',
                        'Price They Bought': obj.priceTheyBought || 0,
                        'Date Updated': obj.dateUpdated ? new Date(obj.dateUpdated).toLocaleString() : ''
                    };
                });
                
                // Create worksheet for this stock's update records
                const updateRecordsWorksheet = XLSX.utils.json_to_sheet(updateRecordsData);
                
                // Set column widths for update records sheet
                const updateRecordsColumnWidths = [
                    { wch: 8 },   // S.No
                    { wch: 15 },  // Stock ID
                    { wch: 15 },  // Count Changed
                    { wch: 15 },  // User ID
                    { wch: 20 },  // User Name
                    { wch: 18 },  // Price They Bought
                    { wch: 20 }   // Date Updated
                ];
                updateRecordsWorksheet['!cols'] = updateRecordsColumnWidths;
                
                // Clean the stock name for sheet name (remove invalid characters)
                let sheetName = stockDetail.stockName || stockDetail.stockId;
                // Replace invalid characters for Excel sheet names
                sheetName = sheetName.replace(/[\\/:*?[\]]/g, '_').substring(0, 31);
                
                // Ensure unique sheet name
                let finalSheetName = sheetName;
                let counter = 1;
                while (workbook.SheetNames.includes(finalSheetName)) {
                    finalSheetName = `${sheetName.substring(0, 28)}_${counter}`;
                    counter++;
                }
                
                // Add update records worksheet to workbook
                XLSX.utils.book_append_sheet(workbook, updateRecordsWorksheet, finalSheetName);
            }
        }
        
        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx' 
        });
        
        // Set response headers for file download
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `stock_details_with_records_export_${timestamp}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file
        return res.send(excelBuffer);
        
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: 'Error exporting stock details to Excel: ' + error.message
        });
    }
};