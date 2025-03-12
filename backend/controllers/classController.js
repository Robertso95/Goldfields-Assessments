const Class = require("../models/classModel"); 
const mongoose = require('mongoose');

// Get all classes
const getClasses = async (req, res) => {
  const classes = await Class.find({}).sort({ createdAt: -1 });
  const classesWithId = classes.map((c) => ({
    ...c.toJSON(),
    id: c._id.toString(),
  }));
  res.status(200).json(classesWithId);
};

// Get a single class
const getClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const singleClass = await Class.findById(id);

  if (!singleClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json({ ...singleClass.toJSON(), id: singleClass._id.toString() });
};

// Create a new class
const createClass = async (req, res) => {
  const { className} = req.body;

  try {
    const newClass = await Class.create({ className });
    res.status(201).json({ ...newClass.toJSON(), id: newClass._id.toString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const deletedClass = await Class.findOneAndDelete({ _id: id });

  if (!deletedClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json(deletedClass);
};

// Update a class
const updateClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const updatedClass = await Class.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );

  if (!updatedClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json({ ...updatedClass.toJSON(), id: updatedClass._id.toString() });
};

// Add a student to a class
const addStudent = async (req, res) => {
  const { id } = req.params; // Class ID
  const student = req.body; // Student object from the request body, including the image URL

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $push: { students: student } }, // Add the student to the class
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "No class found" });
    }

    res.status(200).json(updatedClass);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Transfer a student to a new class
const transferStudent = async (req, res) => {
  const { studentId, oldClassId, newClassId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(oldClassId) || !mongoose.Types.ObjectId.isValid(newClassId)) {
    return res.status(404).json({ error: "Class not found" });
  }
  try {
    // Retrieve the student's data from the old class
    const oldClass = await Class.findById(oldClassId);
    const student = oldClass.students.find(s => s._id.toString() === studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found in the old class" });
    }

    // Remove student from old class
    await Class.findByIdAndUpdate(oldClassId, { $pull: { students: { _id: studentId } } });

    // Add student to new class
    await Class.findByIdAndUpdate(newClassId, { $push: { students: student } });

    res.status(200).json({ message: "Student transferred successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

//Update a student in a class
const updateStudent = async (req, res) => {
  const { classId, studentId } = req.params;
  const updatedInfo = req.body; // updatedInfo might include a new image URL

  if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(404).json({ error: "Invalid class or student ID" });
  }

  try {
    const classToUpdate = await Class.findById(classId);
    const studentIndex = classToUpdate.students.findIndex(s => s._id.toString() === studentId);

    if (studentIndex === -1) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Update the student's details with the new information
    classToUpdate.students[studentIndex] = { ...classToUpdate.students[studentIndex], ...updatedInfo };

    // Save the changes to the class document
    await classToUpdate.save();

    res.status(200).json(classToUpdate.students[studentIndex]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
//update student Assignment
const  updateStudentAssessment = async (req, res) => {
  const { classId, studentId } = req.params;
  const updatedInfo = req.body;

  if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(404).json({ error: "Invalid class or student ID" });
  }

  try {
    console.log("Updating student with data:", updatedInfo); // Debug log

    // Use findOneAndUpdate with the $set operator to update specific fields
    const result = await Class.findOneAndUpdate(
      { 
        "_id": classId,
        "students._id": studentId 
      },
      { 
        "$set": {
          "students.$.assessmentType": updatedInfo.assessmentType,
          "students.$.term": updatedInfo.term,
          //"students.$.term": updatedInfo.dueDate,
          "students.$.tags": updatedInfo.tags
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "Student or class not found" });
    }

    // Find the updated student in the result
    const updatedStudent = result.students.find(
      student => student._id.toString() === studentId
    );

    console.log("Updated student:", updatedStudent); // Debug log
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a student from a class
const deleteStudent = async (req, res) => {
  const { classId, studentId } = req.params;

  // Validate the classId and studentId
  if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(404).json({ error: "Invalid class or student ID" });
  }

  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: { _id: studentObjectId } } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "No class found or student not in class" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get a student in a class
const getStudentInClass = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
      // Validate the classId
      if (!mongoose.Types.ObjectId.isValid(classId)) {
          return res.status(404).json({ error: "Class not found" });
      }

      // Find the class by classId
      const foundClass = await Class.findById(classId);
      if (!foundClass) {
          return res.status(404).json({ error: "Class not found" });
      }

      // Find the student in the class's students array
      const student = foundClass.students.find(s => s._id.toString() === studentId);
      if (!student) {
          return res.status(404).json({ error: "Student not found in the class" });
      }

      // Respond with the found student data
      res.status(200).json(student);
  } catch (error) {
      console.error("Failed to fetch student:", error);
      res.status(500).json({ error: "An error occurred while fetching the student" });
  }
};

// Defined function getStudentList for route fetch
const getStudentList = async (req, res) => {

  try {
    // Trying to get student data 

    const student = await Class.find({}, { "students.image": 0 });
    // Respond with the found student data
    res.status(200).json(student);
  } 
  catch (error) {
    //If error occurs, will message with the corrosponding message
    console.error("Failed to fetch student:", error);
    res.status(500).json({ error: "An error occurred while fetching the student" });
  }
};

const getStudentAssessments = async (req, res) => {
  const { classId, studentId } = req.params;
  
  try {
    // Validate the IDs
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid class or student ID' });
    }

    // Find the class and student
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const student = classDoc.students.find(s => s._id.toString() === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find assignments for this student
    const assignments = await Assignment.find({ 
      studentNames: { $elemMatch: { $eq: `${student.firstName} ${student.lastName}` } }
    });

    // Map the assignments to assessment format
    const assessments = assignments.map(assignment => ({
      _id: assignment._id,
      name: assignment.assignment,
      score: 'Not graded', // You can add a score field to your Assignment model if needed
      date: assignment.dueDate,
      status: new Date() > new Date(assignment.dueDate) ? 'Overdue' : 'Pending',
      grade: 'Not graded' // You can add a grade field to your Assignment model if needed
    }));

    // If no assignments found, create one based on the student's assessmentType
    if (assessments.length === 0 && student.assessmentType) {
      assessments.push({
        _id: new mongoose.Types.ObjectId(),
        name: student.assessmentType,
        score: 'Not graded',
        date: new Date(),
        status: 'Assigned',
        grade: 'Not graded'
      });
    }
    
    res.status(200).json(assessments);
  } catch (error) {
    console.error('Error fetching student assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};


// Export the methods
module.exports = {
  getClasses,
  getClass,
  createClass,
  deleteClass,
  updateClass,
  addStudent,
  transferStudent,
  updateStudent,
  updateStudentAssessment,
  deleteStudent,
  getStudentInClass,
  getStudentList,
  getStudentAssessments
};
