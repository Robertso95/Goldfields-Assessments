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

module.exports = router;
