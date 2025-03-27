import React, { useState, useEffect } from "react";
import { Button, Form, Select, Input, Tag } from "antd";
import axios from "axios";
import "./EditTags.css";

const { Option } = Select;

const EditTags = () => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredtags] = useState([]);
  const [tagName, setTagName] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [removeTag, setRemoveTag] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/api/learningsets"); // Adjust API endpoint
        if (response.status === 200) {
          setSubjects(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error("Error fetching assignment titles:", error);
      }
    };

    const fetchAssignmentTypes = async () => {
      try {
        const response = await axios.get("/api/assignmenttype"); // Adjust API endpoint
        if (response.status === 200) {
          setAssignments(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error("Error fetching assignment titles:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get("/api/tags"); // Adjust API endpoint
        if (response.status === 200) {
          setTags(response.data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchSubjects();
    fetchAssignmentTypes();
    fetchTags();
  }, []);

  const handleSubmit = async () => {
    if (selectedAssignment === "") {
      alert("Please select an assignment");
      return;
    }
    if (tagName === "") {
      alert("Please enter a tag name");
      return;
    }

    const newTag = {
      name: tagName,
      parent: selectedAssignment,
      type: "tag",
    };

    try {
      const response = await axios.post("/api/tags", newTag);

      if (response.status === 201) {
        alert("Tag created successfully!");
        setTagName("");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleChangeLearningSet = (value) => {
    setFilteredAssignments(
      assignments.filter((assignment) => {
        return assignment.parent === value;
      })
    );
  };

  const handleChangeAssignmentType = (value) => {
    setFilteredtags(
      tags.filter((tag) => {
        return tag.parent === value && tag.isactive;
      })
    );
    setSelectedAssignment(value);
  };

  const handleRemoveTag = (tagId) => {
    try {
      axios.delete(`/api/tags/${tagId}`);
      alert("Tag deleted successfully!");
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  return (
    <div className="edit-tags-container">
      <h1>Edit Tags</h1>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Subject">
          <Select
            placeholder="Select a subject"
            onChange={handleChangeLearningSet}
          >
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
            onChange={handleChangeAssignmentType}
          >
            {filteredAssignments.map((assignemnt) => (
              <Option key={assignemnt._id} value={assignemnt._id}>
                {assignemnt.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Tags">
          <div className="tag-list">
            {filteredTags.map((tag) => (
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
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Enter new tag"
            name="name"
            id="name"
          />
          <Button type="primary" htmlType="submit">
            Add Tag
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTags;
