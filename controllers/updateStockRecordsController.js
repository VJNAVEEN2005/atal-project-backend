const mongoose = require('mongoose');  // Add this line at the top
const UpdateStockRecords = require('../models/updateStockRecordsModel');
const StockDetail = require('../models/stockDetailModel');
const userModel = require('../models/userModel');

// Update stock count and create a record of the update
exports.updateStockCount = async (req, res) => {
    try {
        const { stockId, countChanged, userId, priceTheyBought, userName } = req.body;

        // Find the stock detail by stockId
        const stockDetail = await StockDetail.findOne({ stockId });

        if (!stockDetail) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock not found'
            });
        }

        // Update the stock count
        stockDetail.count += parseInt(countChanged);
        await stockDetail.save();

        // Create a record of the update
        const createUpdateStockRecords = {
            stockId,
            countChanged,
            userId,
            priceTheyBought,
            userName
        }

        const updateRecord = await UpdateStockRecords.create(createUpdateStockRecords);

        await updateRecord.save();

        res.status(200).json({
            status: 'success',
            data: {
                stockDetail,
                updateRecord
            }
        });
    } catch (err) {
        console.error('Error updating stock count:', err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}


// Return all update records for a specific stock detail
// Return all update records for a specific stock detail
exports.getUpdateRecords = async (req, res) => {
    try {
        const { stockId } = req.params;

        // Find the stock detail by stockId
        const stockDetail = await StockDetail.findOne({ stockId });
        if (!stockDetail) {
            return res.status(404).json({
                status: 'fail',
                message: 'Stock not found'
            });
        }

        // Find all update records and populate the user details
        const updateRecords = await UpdateStockRecords.find({ stockId })
            .populate({ path: 'userId', select: 'userName userId' });

       
        // Transform updateRecords to include userName directly (optional)
        const enrichedRecords = updateRecords.map(record => ({
            _id: record._id,
            stockId: record.stockId,
            countChanged: record.countChanged,
            priceTheyBought: record.priceTheyBought,
            userId: record.userId,
            userName: record.userName,
            createdAt: record.dateUpdated
        }));

        res.status(200).json({
            status: 'success',
            data: {
                stockDetail,
                updateRecords: enrichedRecords
            }
        });
    } catch (err) {
        console.error('Error fetching update records:', err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}
