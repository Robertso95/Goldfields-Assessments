import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import '../createAssignment.css';

const { TextArea } = Input;

const CreateAssignment = () => {
  const [form] = Form.useForm();
  const [students] = useState([
    { value: 'john_doe', label: 'John Doe' },
    { value: 'jane_smith', label: 'Jane Smith' },
    { value: 'alice_johnson', label: 'Alice Johnson' },
    { value: 'bob_brown', label: 'Bob Brown' },
  ]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [description, setDescription] = useState('');

  const handleSubmit = async (values) => {
    const newAssignment = { ...values, studentNames: selectedStudents, description };

    try {
      const response = await axios.post('/api/assignments', newAssignment);

      if (response.status === 201) {
        alert('Assignment created successfully!');
        form.resetFields();
        setSelectedStudents([]);
        setDescription('');
      } else {
        alert('Failed to create assignment.');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleStudentChange = (value) => {
    if (value.includes('select_all')) {
      if (selectedStudents.length === students.length) {
        setSelectedStudents([]);
      } else {
        setSelectedStudents(students.map(student => student.value));
      }
    } else {
      setSelectedStudents(value);
    }
  };

  return (
    <div className="create-assignment-container">
      <h1>Create Assignment</h1>
      <p>Class: A1024</p>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="create-assignment-form"
        initialValues={{ className: 'A1024' }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <ReactQuill value={description} onChange={setDescription} />
        </Form.Item>
        {/* Removed Upload Feature */}
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
          <Input />
        </Form.Item>
        <Form.Item
          label="Student Name"
          name="studentName"
          rules={[{ required: true, message: 'Please select at least one student!' }]}
        >
          <Select
            mode="multiple"
            showSearch
            style={{ width: '100%' }}
            placeholder="Select students"
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={[
              { value: 'select_all', label: 'Select All' },
              ...students
            ]}
            value={selectedStudents}
            onChange={handleStudentChange}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Assignment
          </Button>
        </Form.Item>
        <Form.Item>
          <Link to="/assessments">
            <Button type="default">
              Return 
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateAssignment;