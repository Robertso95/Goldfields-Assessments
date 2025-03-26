import express from "express";
import Tag from "../models/Tag.js"; // Assuming you have a Tag model

const router = express.Router();

// Get all tags
router.get("/", async (req, res) => {
  const tags = await Tag.find();
  res.json(tags);
});

// Create a new tag
router.post("/", async (req, res) => {
  const tag = new Tag({ name: req.body.name });
  await tag.save();
  res.json(tag);
});

// Update a tag
router.put("/:id", async (req, res) => {
  const tag = await Tag.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  res.json(tag);
});

// Delete a tag
router.delete("/:id", async (req, res) => {
  await Tag.findByIdAndDelete(req.params.id);
  res.json({ message: "Tag deleted" });
});

export default router;
