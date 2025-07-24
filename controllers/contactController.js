const Contact = require('../models/contactModel');

exports.getContactData = async (req, res) => {
    try {
        const contactData = await Contact.findOne();

        if (!contactData) {
            return res.status(404).json({
                success: false,
                message: "Contact data not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Contact data fetched successfully",
            contact: contactData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.updateContactData = async (req, res) => {
    try {
        const contactData = await Contact.findOneAndUpdate({},
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                location: req.body.location,
                instagram: req.body.instagram,
                whatsapp: req.body.whatsapp,
                twitter: req.body.twitter,
                linkedin: req.body.linkedin,
                youtube: req.body.youtube,
                map: req.body.map,
                role: req.body.role

            },
            { new: true, runValidators: true }
        );

        if (!contactData) {
            // create contact data if it doesn't exist
            const newContactData = new Contact({
                name: req.body.name || '',
                email: req.body.email || '',
                phone: req.body.phone || '',
                location: req.body.location || '',
                instagram: req.body.instagram || '',
                whatsapp: req.body.whatsapp || '',
                twitter: req.body.twitter || '',
                linkedin: req.body.linkedin || '',
                youtube: req.body.youtube || '',
                map: req.body.map || '',
                role: req.body.role || ''
            });
            await newContactData.save();
            return res.status(201).json({
                success: true,
                message: "Contact data created successfully",
                contact: newContactData
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact data updated successfully",
            contact: contactData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}