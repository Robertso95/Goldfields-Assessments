//Sprint 1
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/assignments', assignmentController.createAssignment);
router.get('/assignments', assignmentController.getAssignments);
router.get('/learningsets', assignmentController.getSubjects);

module.exports = router;