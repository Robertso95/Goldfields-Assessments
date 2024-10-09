// Assessments.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../assessments.css';

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
        <h1>Assessments</h1>
        <div className="dummy-data">
          <p>Hello, M. Smith</p>
          <p>Goldfields School</p>
          <hr className="divider" />
        </div>
        <div className="boxes">
          <div className="box">Class</div>
          <div className="box">Assignments</div>
        </div>
        <h2 className="students-title">Students</h2>
        <div className="massive-box"></div>
      </div>
    </div>
  );
};

export default Assessments;