// Assessments.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'antd';
import { Divider } from 'antd';
import '../assessments.css';

const contentStyle = {
  margin: 0,
  height: '200px',
  color: '#fff',
  lineHeight: '200px',
  textAlign: 'center',
  background: '#007bff',

};

const Assessments = () => {
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
      <div class="content-container">
  <div class="dummy-data">
    <p>Hello, M. Smith</p>
    <p>Goldfields School 01/01/2025</p>
  </div>
  <hr class="divider" />
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
                  <h3 style={contentStyle}> Assignment due</h3>
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
        <div class="content-container">
        <h2 className="students-title">Students</h2>
        <div className="massive-box-container">
          <div className="massive-box"></div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Assessments;