const mongoose = require('mongoose');

const equipmentFormSchema = new mongoose.Schema({
    PICK_AND_PLACE_MACHINE: {
        type: String,
        default: ''
    },
    _3D_SCANNER: {
        type: String,
        default: ''
    },
    _3D_PRINTER: {
        type: String,
        default: ''
    },
    RESIN_3D_PRINTER: {
        type: String,
        default: ''
    },
    WEGSTR_PCB_PROTOTYPING_MACHINE: {
        type: String,
        default: ''
    },
    LASER_CUTTING_MACHINE: {
        type: String,
        default: ''
    },
    SKYRC_1080_CHARGER_FOR_LIPO: {
        type: String,
        default: ''
    },
    CELL_IMPEDANCE_TESTER: {
        type: String,
        default: ''
    },
    INVERTER_WELDING_MACHINE: {
        type: String,
        default: ''
    },
    SPOT_WELDING_MACHINE: {
        type: String,
        default: ''
    },
    AGRICULTURE_DRONE: {
        type: String,
        default: ''
    },
    GIMBAL: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EquipmentForm', equipmentFormSchema);
