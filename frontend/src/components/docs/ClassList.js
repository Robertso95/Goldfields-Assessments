import { useContext } from 'react';
import { ClassesContext } from '../../context/ClassesContext';

const ClassList = () => {
  const { classes } = useContext(ClassesContext);

  // Function to format classes
  const formatClasses = (classes) => {
    return classes.map((classEntry) => {
      const studentsNames = classEntry.students.map(student => `${student.firstName} ${student.lastName}`).join(', ');
      return {
        label: classEntry.className,
        value: studentsNames,
      };
    });
  };

  // Get the formatted classes - Sprint 2
  const formattedClasses = formatClasses(classes);

  return (
    <div>
      {formattedClasses.map((classItem, index) => (
        <div key={index}>
          <h3>{classItem.label}</h3>
          <p>{classItem.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ClassList;