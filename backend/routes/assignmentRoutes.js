// backend/routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/assignments', assignmentController.createAssignment);
router.get('/assignments', assignmentController.getAssignments);

module.exports = router;