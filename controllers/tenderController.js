const tenderModel = require('../models/tenderModel');

exports.createTender = async (req, res) => {
    try {

        const tender = req.body;
        const newTender = await tenderModel.create(tender);
        return res.status(201).json({ success: true, message: "Tender created successfully", tender: newTender });


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.getTenders = async (req, res) => {
    try {
        const tenders = await tenderModel.find({});
        return res.status(200).json({ success: true, message: "Tenders fetched successfully", tenders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}