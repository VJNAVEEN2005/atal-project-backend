const ProgramsForm = require('../models/programsformModel');

exports.updateProgramsForm = async (req, res) => {
    try {
        const updatedForm = await ProgramsForm.findOneAndUpdate({},{
            puduvaiStartupSprint: req.body.puduvaiStartupSprint,
            preIncubation: req.body.preIncubation,
            acceleration: req.body.acceleration,
            droneTechnology: req.body.droneTechnology,
            arduinoProgramming: req.body.arduinoProgramming,
            threeDModeling: req.body.threeDModeling,
            raspberryPiDevelopment: req.body.raspberryPiDevelopment,
            Dass: req.body.Dass,
            sisfs: req.body.sisfs,
            propelX: req.body.propelX,
            startupSprouting: req.body.startupSprouting
        },{
            new: true,
            runValidators: true
        });
        if (!updatedForm) {
            const newForm = new ProgramsForm({
                puduvaiStartupSprint: req.body.puduvaiStartupSprint || '',
                preIncubation: req.body.preIncubation || '',
                acceleration: req.body.acceleration || '',
                droneTechnology: req.body.droneTechnology || '',
                arduinoProgramming: req.body.arduinoProgramming || '',
                threeDModeling: req.body.threeDModeling || '',
                raspberryPiDevelopment: req.body.raspberryPiDevelopment || '',
                Dass: req.body.Dass || '',
                sisfs: req.body.sisfs || '',
                propelX: req.body.propelX || '',
                startupSprouting: req.body.startupSprouting || ''
            });
            await newForm.save();
        }
        return res.status(200).json({
            success: true,
            message: "Programs form updated successfully",
            data: updatedForm
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


exports.getProgramsForm = async (req, res) => {
    try {
        const programsForm = await ProgramsForm.findOne({});
        if (!programsForm) {
            return res.status(404).json({
                success: false,
                message: "Programs form not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: programsForm
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}