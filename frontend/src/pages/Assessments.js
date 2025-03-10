import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Carousel, Select } from 'antd';
import { Link } from 'react-router-dom';
import '../assessments.css';

const { Option } = Select;

const Assessments = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes'); // Replace with your API endpoint
        const data = await response.json();
        setClasses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleClassChange = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}`); // Replace with your API endpoint
      const data = await response.json();
      setSelectedClass(data);
      setStudents(data.students || []); // Ensure students is an array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class data:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <a href="#">{text}</a>,
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
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color;
            switch (tag.toLowerCase()) {
              case 'hardworking':
                color = 'green';
                break;
              case 'dedicated':
                color = 'blue';
                break;
              case 'focused':
                color = 'orange';
                break;
              case 'creative':
                color = 'purple';
                break;
              case 'team player':
                color = 'cyan';
                break;
              case 'determined':
                color = 'gold';
                break;
              case 'improving':
                color = 'lime';
                break;
              case 'brilliant':
                color = 'geekblue';
                break;
              case 'leadership':
                color = 'red';
                break;
              default:
                color = tag.length > 5 ? 'geekblue' : 'green';
            }

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
          <button className="blue-button">Edit</button>
          <button className="blue-button">View</button>
        </Space>
      ),
    },
  ];

  const data = students.map((student, index) => ({
    key: index + 1,
    fullName: `${student.firstName} ${student.lastName}`,
    class: selectedClass ? selectedClass.className : '',
    term: 'Term 1', // Dummy data
    assessmentType: 'Mid-term Exam', // Dummy data
    tags: ['hardworking', 'dedicated'], // Dummy data
  }));

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
              <Table columns={columns} dataSource={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;