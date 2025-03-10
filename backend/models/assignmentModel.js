//Sprint 1
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  subject: {
    type: String,
    required: true,
  },
  assignment: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  className: {
    type: String,
  },
  studentNames: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assignment', assignmentSchema);