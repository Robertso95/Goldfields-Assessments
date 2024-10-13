import React from 'react';
import { Space, Table, Tag, Carousel } from 'antd';
import { Link } from 'react-router-dom';
import '../assessments.css';

const columns = [
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName',
    // eslint-disable-next-line
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
          
          // Assign different colors based on tag values
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
              color = tag.length > 5 ? 'geekblue' : 'green'; // Default color based on length
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
        <button className="green-button">Edit</button>
        <button className="green-button">View</button>
      </Space>
    ),
  },
];


const data = [
  {
    key: '1',
    fullName: 'Mia Hernandez',
    class: 'A1024',
    term: 'Term 1',
    assessmentType: 'Mid-term Exam',
    tags: ['hardworking', 'dedicated'],
  },
  {
    key: '2',
    fullName: 'Emma Johnson',
    class: 'A1024',
    term: 'Term 2',
    assessmentType: 'Final Exam',
    tags: ['focused'],
  },
  {
    key: '3',
    fullName: 'Daniel Garcia',
    class: 'A1024',
    term: 'Term 1',
    assessmentType: 'Quiz',
    tags: ['excellent', 'consistent'],
  },
  {
    key: '4',
    fullName: 'Ethan Wilson',
    class: 'A1024',
    term: 'Term 3',
    assessmentType: 'Project Presentation',
    tags: ['creative', 'team player'],
  },
  {
    key: '5',
    fullName: 'Jamal Davis',
    class: 'A1024',
    term: 'Term 2',
    assessmentType: 'Mid-term Exam',
    tags: ['determined', 'improving'],
  },
  {
    key: '6',
    fullName: 'Noah Williams',
    class: 'A1024',
    term: 'Term 1',
    assessmentType: 'Final Exam',
    tags: ['brilliant', 'leadership'],
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

const Assessments = () => (
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
          <p>Hello, M. Smith</p>
          <p>Goldfields School 01/01/2025</p>
        </div>
        <hr className="divider" />
      </div>
      <div className="boxes-container">
        <div className="boxes">
          <div className="box">
            <Carousel arrows infinite={false}>
              <div>
                <h3 style={contentStyle}>Class A1024</h3>
              </div>
              <div>
                <h3 style={contentStyle}>6 Students</h3>
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

export default Assessments;