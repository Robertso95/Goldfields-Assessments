//classModel.js is a model for the class collection in the database. 
//It contains the schema for the class collection. The class collection contains the following fields:


const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  students: [studentSchema],
});

module.exports = mongoose.model('Class', classSchema);
