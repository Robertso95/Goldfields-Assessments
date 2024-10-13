const Assignment = require('../models/assignmentModel');

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, className, studentNames } = req.body; // Updated to studentNames
    const newAssignment = new Assignment({ title, description, dueDate, className, studentNames }); // Updated to studentNames
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};