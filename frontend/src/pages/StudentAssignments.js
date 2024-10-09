// src/pages/StudentAssignments.js
import React, { useState, useEffect } from 'react';
import '../assessments.css';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    // Fetch existing assignments from the backend
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="assignments-container">
      <h1 className="assignments-title">Student Assignments</h1>
      <ul className="assignments-list">
        {assignments.map((item, index) => (
          <li key={index} className="assignment-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>Due Date: {item.dueDate}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentAssignments;