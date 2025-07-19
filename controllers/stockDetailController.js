const StockDetail = require('../models/stockDetailModel');
const mongoose = require('mongoose');  // Add this line at the top
const UpdateStockRecords = require('../models/updateStockRecordsModel');
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

// Get all stock details
exports.getAllStockDetails = async (req, res) => {
    try {
        const stockDetails = await StockDetail.find();

        res.status(200).json({
            status: 'success',
            data: stockDetails
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