//Sprint 1
const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");

router.post("/assignments", assignmentController.createAssignment);
router.get("/assignments", assignmentController.getAssignments);
router.get("/learningsets", assignmentController.getSubjects);
router.get("/assignmenttype", assignmentController.getAssignmentsType);
router.get("/tags", assignmentController.getTags);
router.post("/tags", assignmentController.createTag);
router.post("/assignmentimages", assignmentController.createAssignmentImage);
router.delete("/tags/:id", assignmentController.deleteTag);

// Original routes
router.put("/assignments/:id", assignmentController.updateAssignment);
router.patch("/assignments/:id", assignmentController.updateAssignment);
router.delete("/assignments/:id", assignmentController.deleteAssignment);

// Alternative routes for testing
router.post("/assignments/update/:id", assignmentController.updateAssignmentPost);
router.post("/assignments/delete/:id", assignmentController.deleteAssignmentPost);

module.exports = router;