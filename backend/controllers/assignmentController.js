const Assignment = require("../models/assignmentModel");
const learningsets = require("../models/learningSetModel");
const counters = require("../models/countersModel");

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json({
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
};

// Get all assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};

// Get all assignments where type is 'folder'
const getSubjects = async (req, res) => {
  try {
    const subjects = await learningsets.find({ type: "folder" });
    console.log("Subjects fetched from DB:", subjects);
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

//Get all assignments where type is 'assignment'
const getAssignmentsType = async (req, res) => {
  try {
    const assignments = await learningsets.find({ type: "assignment" });

    console.log("Assignments fetched from DB:", assignments);
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};

const createTag = async (req, res) => {
  try {
    const id = await counters.findOneAndUpdate(
      { _id: "learningsets" },
      { $inc: { sequence: 1 } },
      { new: true }
    );
    console.log("ID:", id);
    req.body._id = id.sequence;
    const newTag = new learningsets(req.body);
    await newTag.save();

    res.status(201).json({
      message: "Tag created successfully",
      assignment: newTag,
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

const deleteTag = async (req, res) => {
  try {
    const id = await learningsets.findOneAndUpdate(
      { _id: req.params.id },
      { isactive: false },
      { new: true }
    );
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};

//Get all assignments where type is 'tag'
const getTags = async (req, res) => {
  try {
    const tags = await learningsets.find({ type: "tag" });
    console.log("Tags fetched from DB:", tags);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

const createAssignmentImage = async (req, res) => {
  const image = new HomeImage({
    imageUrl: req.body.imageUrl,
  });
  try {
    const newImage = await image.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getSubjects,
  getAssignmentsType,
  getTags,
  createAssignmentImage,
  createTag,
  deleteTag,
};
