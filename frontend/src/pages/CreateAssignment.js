// CreateAssignment.js
import React, { useState } from 'react';
import '../assessments.css';

const CreateAssignment = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAssignment = { title, description, dueDate, className, studentName };

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        setTitle('');
        setDescription('');
        setDueDate('');
        setClassName('');
        setStudentName('');
      } else {
        alert('Failed to create assignment.');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <div>
      <h1>Create Assignment</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Class Name:</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Student Name:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
};

export default CreateAssignment;