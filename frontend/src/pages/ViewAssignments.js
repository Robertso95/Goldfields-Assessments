import React, { useState, useEffect } from 'react';
import '../assessments.css';

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        const data = await response.json();
        console.log(data); // Log the data to check its structure
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div>
      <h1>View Assignments</h1>
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment._id}>
            <h2>{assignment.title}</h2>
            <p>{assignment.description}</p>
            <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p>Class Name: {assignment.className}</p>
            <p>Student Name: {assignment.studentName}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewAssignments;