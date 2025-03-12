import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Form, Select, Modal, Tag } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import '../createAssignment.css';
import CheckboxTagList from '../components/CheckboxTagList/CheckboxTagList';

const { Option } = Select;

const CreateAssignment = () => {
  const [form] = Form.useForm();
  const [students] = useState([
    { value: 'Mia Hernandez', label: 'Mia Hernandez' },
    { value: 'Emma Johnson', label: 'Emma Johnson' },
    { value: 'Daniel Garcia', label: 'Daniel Garcia' },
    { value: 'Ethan Wilson', label: 'Ethan Wilson' },
    { value: 'Jamal Davis', label: 'Jamal Davis' },
    { value: 'Noah William', label: 'Noah William' },
  ]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [description, setDescription] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [learningSets, setLearningSets] = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredtags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);



  // Fetch assignment titles from MongoDB
  useEffect(() => {
    const fetchLearningSets= async () => {
      try {
        const response = await axios.get('/api/learningsets'); // Adjust API endpoint
        if (response.status === 200) {
          setLearningSets(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error('Error fetching assignment titles:', error);
      }
    };

    const fetchAssignmentTypes= async () => {
      try {
        const response = await axios.get('/api/assignmenttype'); // Adjust API endpoint
        if (response.status === 200) {
          setAssignmentTypes(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error('Error fetching assignment titles:', error);
      }
    }

    const fetchTags = async () => {
      try {
        const response = await axios.get('/api/tags'); // Adjust API endpoint
        if (response.status === 200) {
          setTags(response.data); // Assuming response.data is an array of titles
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }

    fetchLearningSets();
    fetchAssignmentTypes();
    fetchTags();
  }, []);

  const handleSubmit = async (values) => {
    const newAssignment = { ...values, studentNames: selectedStudents, description, tags: selectedTags };

    try {
      const response = await axios.post('/api/assignments', newAssignment);

      if (response.status === 201) {
        alert('Assignment created successfully!');
        form.resetFields();
        setSelectedStudents([]);
        setDescription('');
        setSelectedTags([]);
      } else {
        alert('Failed to create assignment.');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleStudentChange = (value) => {
    if (value.includes('select_all')) {
      setSelectedStudents(students.map(student => student.value));
    } else {
      setSelectedStudents(value);
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    form.setFieldsValue({ description: value });
  };

  const handleChangeLearningSet = (value) => {
    setFilteredAssignments(assignmentTypes.filter((assignment) => {
      return assignment.parent === value
    }))
    
  }

  const handleChangeAssignmentType = (value) => {
    setFilteredtags(tags.filter((tag) => {
      return tag.parent === value
    }
    ))
  }

  return (
    <div className="create-assignment-container">
      <h1>Create Assignment</h1>
      <p>Class: A1024</p>
      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="create-assignment-form"
          initialValues={{ className: 'A1024' }}
        >

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: 'Please select the title!' }]}
          >
            <Select placeholder="Select a subject" onChange={(value) => {handleChangeLearningSet(value)}}>
              {learningSets.map((subject) => 
                <Option key={subject._id} value={subject._id}>
                  {subject.name}
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Assignment"
            name="assignment"
            rules={[{ required: true, message: 'Please select an assignemnt' }]}
          >
            <Select placeholder="Select an assignment" onChange={(value) => {handleChangeAssignmentType(value)}}>
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

          <Form.Item
            label="Additional Comments"
            name="additionalComments"
          >
            <input type="text" />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select the due date!' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: 'Please input the class name!' }]}
          >
            <Select disabled defaultValue="A1024">
              <Option value="A1024">A1024</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Student Name"
            name="studentName"
            rules={[{ required: true, message: 'Please select at least one student!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select students"
              value={selectedStudents}
              onChange={handleStudentChange}
              options={[{ value: 'select_all', label: 'Select All' }, ...students]}
            />
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
        bodyStyle={{ height: '70vh', overflowY: 'auto' }}
      >
        <ReactQuill value={description} onChange={handleDescriptionChange} className="description-editor-modal" />
      </Modal>
    </div>
  );
};

export default CreateAssignment;
