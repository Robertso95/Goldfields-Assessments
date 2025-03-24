import React, { useState, useEffect, useRef } from "react";
import { Button, DatePicker, Form, Select, Modal, Tag } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import "../createAssignment.css";
import CheckboxTagList from "../components/CheckboxTagList/CheckboxTagList";

const { Option } = Select;

const CreateAssignment = () => {
  const [form] = Form.useForm();
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [description, setDescription] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [learningSets, setLearningSets] = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredtags] = useState([]);
  /**
   * @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]}
   */
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const cloudinaryWidgetRef = useRef();
  const [classes, setClasses] = useState([]);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "drpnvb7qc",
        uploadPreset: "tetlineq",
        sources: ["local"],
        clientAllowedFormats: ["image", "video"],
        multiple: true,
      },
      // The function the widget runs after you upload an image
      async (error, result) => {
        if (!error && result && result.event === "success") {
          setImages([...images, result.info.secure_url]);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      }
    );
  }, []);

  const handleImageUpload = () => {
    cloudinaryWidgetRef.current.open();
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/api/classes"); // Adjust API endpoint
        if (response.status === 200) {
          setClasses(response.data); // Assuming response.data is an array of classes
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleClassChange = (classId) => {
    const selectedClass = classes.find((cls) => cls._id === classId);
    if (selectedClass) {
      setClassStudents(selectedClass.students);
    } else {
      setClassStudents([]);
    }
  };

  // Fetch assignment titles from MongoDB
  useEffect(() => {
    const fetchLearningSets = async () => {
      try {
        const response = await axios.get("/api/learningsets"); // Adjust API endpoint
        if (response.status === 200) {
          setLearningSets(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error("Error fetching assignment titles:", error);
      }
    };

    const fetchAssignmentTypes = async () => {
      try {
        const response = await axios.get("/api/assignmenttype"); // Adjust API endpoint
        if (response.status === 200) {
          setAssignmentTypes(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error("Error fetching assignment titles:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get("/api/tags"); // Adjust API endpoint
        if (response.status === 200) {
          setTags(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchLearningSets();
    fetchAssignmentTypes();
    fetchTags();
  }, []);

  const handleSubmit = async (values) => {
    const newAssignment = {
      ...values,
      studentNames: selectedStudents,
      description,
      tags: selectedTags,
      evidence: images,
    };

    try {
      const response = await axios.post("/api/assignments", newAssignment);

      if (response.status === 201) {
        alert("Assignment created successfully!");
        form.resetFields();
        setSelectedStudents([]);
        setDescription("");
        setSelectedTags([]);
        setImages([]);
      } else {
        alert("Failed to create assignment.");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const handleStudentChange = (value) => {
    setSelectedStudents(value);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    form.setFieldsValue({ description: value });
  };

  const handleChangeLearningSet = (value) => {
    setFilteredAssignments(
      assignmentTypes.filter((assignment) => {
        return assignment.parent === value;
      })
    );
  };

  const handleChangeAssignmentType = (value) => {
    setFilteredtags(
      tags.filter((tag) => {
        return tag.parent === value;
      })
    );
  };

  return (
    <div className="create-assignment-container">
      <h1>Create Assignment</h1>
      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="create-assignment-form"
        >
          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: "Please select a class name!" }]}
          >
            <Select
              placeholder="Select class name"
              onChange={handleClassChange}
            >
              {classes.map((cls) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.className}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Student Name"
            name="studentNames"
            rules={[{ required: true, message: "Please select a student!" }]}
          >
            <Select
              placeholder="Select student"
              value={selectedStudents}
              onChange={setSelectedStudents}
            >
              {classStudents.map((student) => (
                <Option key={student._id} value={student._id}>
                  {`${student.firstName} ${student.lastName}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please select the title!" }]}
          >
            <Select
              placeholder="Select a subject"
              onChange={(value) => {
                handleChangeLearningSet(value);
              }}
            >
              {learningSets.map((subject) => (
                <Option key={subject._id} value={subject._id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Assignment"
            name="assignment"
            rules={[{ required: true, message: "Please select an assignemnt" }]}
          >
            <Select
              placeholder="Select an assignment"
              onChange={(value) => {
                handleChangeAssignmentType(value);
              }}
            >
              {filteredAssignments.map((assignment) => (
                <Option key={assignment._id} value={assignment._id}>
                  {assignment.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Tags">
            <CheckboxTagList
              tags={filteredTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          </Form.Item>

          <Form.Item label="Additional Comments" name="additionalComments">
            <input type="text" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleImageUpload}>
              Upload Evidence
            </Button>
          </Form.Item>

          <Form.Item
            label="Completed Date"
            name="completedDate"
            rules={[
              { required: false, message: "Please select the completed date!" },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Description Modal */}
      <Modal
        title="Edit Description"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "70vh", overflowY: "auto" }}
      >
        <ReactQuill
          value={description}
          onChange={handleDescriptionChange}
          className="description-editor-modal"
        />
      </Modal>
    </div>
  );
};

export default CreateAssignment;
