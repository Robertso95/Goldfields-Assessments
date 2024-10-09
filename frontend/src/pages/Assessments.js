// Sprint One
import React, { useState, useEffect } from 'react';
import '../assessments.css';

const Assessments = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() && description.trim() && dueDate.trim()) {
      try {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description, dueDate }),
        });
        if (response.ok) {
          const newAssignment = await response.json();
          setAssignments([...assignments, newAssignment]);
          setTitle('');
          setDescription('');
          setDueDate('');
        } else {
          console.error('Failed to create assignment');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="assessments-container">
      <h1 className="assessments-title">Assessments</h1>
      <p className="assessments-description">Manage student assignments here.</p>
      <form onSubmit={handleSubmit} className="assignment-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          className="assignment-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter assignment description"
          className="assignment-textarea"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="assignment-input"
        />
        <button type="submit" className="assignment-submit">Create Assignment</button>
      </form>
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

export default Assessments;