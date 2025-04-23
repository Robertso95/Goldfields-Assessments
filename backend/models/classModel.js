//classModel.js is a model for the class collection in the database. 
//It contains the schema for the class collection. The class collection contains the following fields:


const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  image: {
    type: String, 
  },
  // Add these fields
  assessmentType: {
    type: String,
    default: ''
  },
  term: {
    type: String,
    default: 'Term 1'
  },
  tags: {
    type: [String],
    default: ['hardworking']
  }
});

// Fix the variable name to match the export
const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  // Main teacher remains as is
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Add an array for additional teachers
  additionalTeachers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  students: [studentSchema], // Include the student schema here
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
