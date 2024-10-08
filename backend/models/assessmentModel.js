// Structure for an assessment

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId
    }

})