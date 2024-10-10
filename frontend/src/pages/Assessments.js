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
      </div>
      <div className="main-content">
      <div class="content-container">
  <div class="dummy-data">
    <p>Hello, M. Smith</p>
    <p>Goldfields School</p>
  </div>
  <hr class="divider" />
</div>
        <div className="boxes-container">
          <div className="boxes">
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>Class 1</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Class 2</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Class 3</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Class 4</h3>
                </div>
              </Carousel>
            </div>
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>Assignment 1</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment 2</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment 3</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment 4</h3>
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