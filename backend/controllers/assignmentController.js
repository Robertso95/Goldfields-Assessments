const Assignment = require('../models/assignmentModel');
const learningsets = require('../models/learningSetModel');

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

// Get all assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Get all assignments where type is 'folder'
const getSubjects = async (req, res) => {
try {
    const subjects = await learningsets.find({type: "folder"});
    console.log('Subjects fetched from DB:', subjects);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};


module.exports = { createAssignment, getAssignments, getSubjects };
