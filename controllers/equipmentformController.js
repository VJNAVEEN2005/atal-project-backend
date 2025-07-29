const EquipmentForm = require('../models/equipmentformModel');

exports.updateEquipmentForm = async (req, res) => {
    try {
        const updatedForm = await EquipmentForm.findOneAndUpdate({}, {
            PICK_AND_PLACE_MACHINE: req.body.PICK_AND_PLACE_MACHINE || '',
            _3D_SCANNER: req.body._3D_SCANNER || '',
            _3D_PRINTER: req.body._3D_PRINTER || '',
            RESIN_3D_PRINTER: req.body.RESIN_3D_PRINTER || '',
            WEGSTR_PCB_PROTOTYPING_MACHINE: req.body.WEGSTR_PCB_PROTOTYPING_MACHINE || '',
            LASER_CUTTING_MACHINE: req.body.LASER_CUTTING_MACHINE || '',
            SKYRC_1080_CHARGER_FOR_LIPO: req.body.SKYRC_1080_CHARGER_FOR_LIPO || '',
            CELL_IMPEDANCE_TESTER: req.body.CELL_IMPEDANCE_TESTER || '',
            INVERTER_WELDING_MACHINE: req.body.INVERTER_WELDING_MACHINE || '',
            SPOT_WELDING_MACHINE: req.body.SPOT_WELDING_MACHINE || '',
            AGRICULTURE_DRONE: req.body.AGRICULTURE_DRONE || '',
            GIMBAL: req.body.GIMBAL || ''
        }, {
            new: true,
            runValidators: true,
            upsert: true // This will create a new document if none exists
        });

        return res.status(200).json({
            success: true,
            message: "Equipment form updated successfully",
            data: updatedForm
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getEquipmentForm = async (req, res) => {
    try {
        const equipmentForm = await EquipmentForm.findOne({});
        if (!equipmentForm) {
            // If no form exists, return default empty form
            const defaultForm = new EquipmentForm({
                PICK_AND_PLACE_MACHINE: '',
                _3D_SCANNER: '',
                _3D_PRINTER: '',
                RESIN_3D_PRINTER: '',
                WEGSTR_PCB_PROTOTYPING_MACHINE: '',
                LASER_CUTTING_MACHINE: '',
                SKYRC_1080_CHARGER_FOR_LIPO: '',
                CELL_IMPEDANCE_TESTER: '',
                INVERTER_WELDING_MACHINE: '',
                SPOT_WELDING_MACHINE: '',
                AGRICULTURE_DRONE: '',
                GIMBAL: ''
            });
            return res.status(200).json({
                success: true,
                data: defaultForm
            });
        }
        return res.status(200).json({
            success: true,
            data: equipmentForm
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteEquipmentForm = async (req, res) => {
    try {
        const deletedForm = await EquipmentForm.findOneAndDelete({});
        if (!deletedForm) {
            return res.status(404).json({
                success: false,
                message: "No equipment form found to delete"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Equipment form deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
