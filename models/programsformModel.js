const mongoose = require('mongoose');

const programsFormSchema = new mongoose.Schema({
    puduvaiStartupSprint: {
        type: String,
    },
    preIncubation: {
        type: String,
    },
    acceleration: {
        type: String,
    },
    droneTechnology: {
        type: String,
    },
    arduinoProgramming: {
        type: String,
    },
    threeDModeling:{
        type: String,
    },
    raspberryPiDevelopment: {
        type: String,
    },
    Dass:{
        type: String,
    },
    sisfs:{
        type: String,
    },
    propelX:{
        type: String,
    },
    startupSprouting:{
        type: String,
    }
});

module.exports = mongoose.model('ProgramsForm', programsFormSchema);
