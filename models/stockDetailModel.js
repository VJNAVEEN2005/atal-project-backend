const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockDetailSchema = new Schema({
    stockId: {
        type: String,
        required: true,
        unique: true
    },
    stockName: {
        type: String,
        required: true
    },
    stockImage: {
        data: Buffer,
        contentType: String,
        fileName: String
    },
    count: {
        type: Number,
        default: 0,
        min: 0
    },
    stockType: {
        type: String,
        required: true,
        enum: ['Electronic', 'Stationry Items', 'Food Inventory']
    },
})

const StockDetail = mongoose.model('StockDetail', stockDetailSchema);

module.exports = StockDetail;