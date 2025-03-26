import React, { useState, useEffect } from "react";
import { Button, Form, Select, Input, Tag } from "antd";
import axios from "axios";
import "./EditTags.css";

const { Option } = Select;

const EditTags = () => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]); // We will use this to store the filtered tags
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/api/learningsets");
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get("/api/assignmenttype");
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      // Filter assignments based on the selected subject
      setFilteredTags(
        assignments.filter(
          (assignment) => assignment.parent === selectedSubject
        )
      );
    }
  }, [selectedSubject, assignments]);

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const handleAssignmentChange = async (assignmentId) => {
    setSelectedAssignment(assignmentId);
    try {
      // Fetch tags based on selected assignment
      const response = await axios.get(`/api/tags?assignment=${assignmentId}`);
      setTags(response.data); // Set the tags for the selected assignment
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const response = await axios.post("/api/tags", {
        name: newTag,
        assignment: selectedAssignment,
      });
      setTags([...tags, response.data]);
      setNewTag("");
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await axios.delete(`/api/tags/${tagId}`);
      setTags(tags.filter((tag) => tag._id !== tagId));
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  return (
    <div className="edit-tags-container">
      <h1>Edit Tags</h1>
      <Form form={form} layout="vertical">
        <Form.Item label="Subject">
          <Select placeholder="Select a subject" onChange={handleSubjectChange}>
            {subjects.map((subject) => (
              <Option key={subject._id} value={subject._id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Assignment">
          <Select
            placeholder="Select an assignment"
            onChange={handleAssignmentChange}
            disabled={!selectedSubject}
          >
            {assignments
              .filter((assignment) => assignment.parent === selectedSubject)
              .map((assignment) => (
                <Option key={assignment._id} value={assignment._id}>
                  {assignment.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Tags">
          <div className="tag-list">
            {tags.map((tag) => (
              <Tag
                key={tag._id}
                closable
                onClose={() => handleRemoveTag(tag._id)}
              >
                {tag.name}
              </Tag>
            ))}
          </div>
        </Form.Item>

        <Form.Item label="New Tag">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter new tag"
          />
          <Button
            type="primary"
            onClick={handleAddTag}
            disabled={!selectedAssignment}
          >
            Add Tag
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTags;
