import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Carousel, Select, Modal, Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import '../assessments.css';

const { Option } = Select;

const Assessments = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClasses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchClasses();
    fetchAssignments();
  }, []);

  const handleClassChange = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}`);
      const data = await response.json();
      setSelectedClass(data);
      // Map the students data to include all necessary fields
      const mappedStudents = data.students.map(student => ({
        ...student,
        key: student._id,
        fullName: `${student.firstName} ${student.lastName}`,
        class: data.className,
        term: student.term || 'Term 1',
        assessmentType: student.assessmentType || '',
        tags: student.tags || ['hardworking']
      }));
      setStudents(mappedStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class data:', error);
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    console.log('Editing student:', record); // Debug log
    setEditingStudent(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      term: record.term || 'Term 1',
      assessmentType: record.assessmentType || '',
      tags: record.tags ? record.tags.join(', ') : ''
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedStudent = {
        ...editingStudent,
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim())
      };

      const response = await fetch(`/api/classes/${selectedClass._id}/students/${editingStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      // Update the student in the local state
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === editingStudent._id
            ? { ...student, ...updatedStudent }
            : student
        )
      );

      setIsModalVisible(false);
      setEditingStudent(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => <a onClick={() => handleEdit(record)}>{text}</a>,
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Term',
      dataIndex: 'term',
      key: 'term',
    },
    {
      title: 'Assessment Type',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags) => (
        <>
          {tags.map((tag) => {
            let color = 'green';
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <button className="blue-button" onClick={() => handleEdit(record)}>Edit</button>
          <button className="blue-button">View</button>
        </Space>
      ),
    },
  ];

  const contentStyle = {
    margin: 0,
    height: '200px',
    color: '#fff',
    lineHeight: '200px',
    textAlign: 'center',
    background: '#007bff',
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="sidebar">
        <h2>My Dashboard</h2>
        <Link to="/create-assignment" className="button">
          + Create New Assignment
        </Link>
        <Link to="/view-assignments" className="button">
          View Assignments
        </Link>
        <Link to="/" className="button">
          Analysis
        </Link>
      </div>
      <div className="main-content">
        <div className="content-container">
          <div className="dummy-data">
            <p>Hello, Admin</p>
            <p>Goldfields School 01/01/2025</p>
          </div>
          <hr className="divider" />
        </div>
        <div className="boxes-container">
          <div className="boxes">
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>{selectedClass ? selectedClass.className : 'Class'}</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>{students.length} Students</h3>
                </div>
              </Carousel>
            </div>
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>Assignment Now</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment due</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment Next</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment Analysis</h3>
                </div>
              </Carousel>
            </div>
          </div>
        </div>
        <div className="content-container">
          <h2 className="students-title">Select Class</h2>
          <Select
            style={{ width: 200 }}
            placeholder="Select a class"
            onChange={handleClassChange}
          >
            {classes.map((classItem) => (
              <Option key={classItem._id} value={classItem._id}>
                {classItem.className}
              </Option>
            ))}
          </Select>
        </div>
        <div className="content-container">
          <h2 className="students-title">Students</h2>
          <div className="massive-box-container">
            <div className="massive-box">
              <Table columns={columns} dataSource={students} />
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Edit Student"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={editingStudent}
        >
          <Form.Item 
            name="firstName" 
            label="First Name"
          >
            <Input disabled defaultValue={editingStudent?.firstName} />
          </Form.Item>
          <Form.Item 
            name="lastName" 
            label="Last Name"
          >
            <Input disabled defaultValue={editingStudent?.lastName} />
          </Form.Item>
          <Form.Item 
            name="term" 
            label="Term" 
            rules={[{ required: true, message: 'Please enter the term' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="assessmentType" 
            label="Assessment Type" 
            rules={[{ required: true, message: 'Please select the assessment type' }]}
          >
            <Select>
              {assignments.map((assignment) => (
                <Option key={assignment._id} value={assignment.title}>
                  {assignment.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="tags" 
            label="Tags" 
            rules={[{ required: true, message: 'Please enter the tags' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Assessments;