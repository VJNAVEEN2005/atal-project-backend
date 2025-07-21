const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const updateStockRecordsSchema = new Schema({
    stockId: {
        type: String,
        required: true,
    },
    countChanged: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    priceTheyBought: {
        type: Number,
    },
    userName: {
        type: String,
        required: true
    },
    dateUpdated: {
        type: Date,
        default: Date.now
    }
})

const UpdateStockRecords = mongoose.model('UpdateStockRecords', updateStockRecordsSchema);

module.exports = UpdateStockRecords;