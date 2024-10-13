import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assessments.css';

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('/api/assignments');
        const data = await response.data;
        console.log(data); // Log the data to check its structure
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="view-assignments-container">
      <h1>View Assignments</h1>
      <ul className="assignments-list">
        {assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          assignments.map((assignment) => (
            <li key={assignment._id} className="assignment-item">
              <h2>{assignment.title}</h2>
              <p dangerouslySetInnerHTML={{ __html: assignment.description }}></p>
              <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p>Class Name: {assignment.className}</p>
              <p>Student Names:</p>
              <ul>
                {assignment.studentNames.map((studentName, index) => (
                  <li key={index}>{studentName}</li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ViewAssignments;