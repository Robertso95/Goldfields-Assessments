const express = require('express');
const router = express.Router();

// Import the class controller methods
const {
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
  getStudentAssessments,
  getClassByTeacherId,
  assignTeacherToClass,
  getStudentList,
  assignAdditionalTeacherToClass,
  getClassTeachers,
  getClassesByTeacher
} = require('../controllers/classController');

// Routes for the Class model
router.get('/list', getStudentList); 

router.get('/', getClasses); // Get all classes
router.get('/:id', getClass); // Get a single class by ID
router.post('/', createClass); // Create a new class
router.delete('/:id', deleteClass); // Delete a class by ID
router.patch('/:id', updateClass); // Update a class by ID
router.post('/:id/students', addStudent); // Add a student to a class, handling image upload
router.post('/transfer-student', transferStudent); // Transfer a student to a new class
router.put('/:classId/students/:studentId', updateStudent); // Update a student in a class, handling image upload
router.delete('/:classId/students/:studentId', deleteStudent); // Delete a student from a class
router.get('/:classId/students/:studentId', getStudentInClass); // Get a student in a class
router.patch('/:classId/students/:studentId', updateStudentAssessment);
router.get('/classes/:classId/students/:studentId/assessments', getStudentAssessments);
router.post('/assign-teacher', assignTeacherToClass);
router.get('/teacher/:teacherId', getClassByTeacherId);
router.post('/assign-additional-teacher', assignAdditionalTeacherToClass);
router.get('/:classId/teachers', getClassTeachers);
// Add this route
router.get('/teacher/:teacherId/all-classes', getClassesByTeacher);


module.exports = router;
