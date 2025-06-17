import { useState, useEffect } from "react";

import {
  Space,
  Table,
  Tag,
  Carousel,
  Select,
  Modal,
  Form,
  Input,
  Button,
  message,
  Spin,
} from "antd";
import { SearchOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import StudentAssessmentView from "../components/StudentAssessmentView";
import { Link, useNavigate } from "react-router-dom";
import "../assessments.css";
import { format } from "date-fns";
// Import Logo component instead of direct image path
import Logo from "../components/logov3";
import { useLoading } from '../context/LoadingContext';
const { Option } = Select;
const { Search } = Input;

const Assessments = () => {
  const { setIsPageLoading } = useLoading();
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form] = Form.useForm()
  const [learningSets, setLearningSets] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [classLoading, setClassLoading] = useState(false);


  // New state for user information
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    role: "Admin",
    teacherClassId: null
  });

  const getTagColor = (tag) => {
    switch (tag.toLowerCase()) {
      case "hardworking":
        return "green";
      case "dedicated":
        return "blue";
      case "focused":
        return "orange";
      case "creative":
        return "purple";
      case "team player":
        return "cyan";
      case "determined":
        return "gold";
      case "improving":
        return "lime";
      case "brilliant":
        return "geekblue";
      case "leadership":
        return "red";
      default:
        return tag.length > 5 ? "geekblue" : "green"; // Default color based on length
    }
  };

const fetchLearningSets = async () => {
  setLoadingSubjects(true);
  try {
    const response = await fetch("/api/learningsets");
    const data = await response.json();
    console.log("Fetched learning sets:", data);
    setLearningSets(data);
  } catch (error) {
    console.error("Error fetching learning sets:", error);
  } finally {
    setLoadingSubjects(false);
  }
};

useEffect(() => {
  // Get user info from localStorage
  const userRole = localStorage.getItem("role") || "Admin";
  const userName = localStorage.getItem("name") || "Admin";
  const email = localStorage.getItem("email");
  
  console.log("User role:", userRole);
  console.log("User name:", userName);
  
  setCurrentUser({
    name: userName,
    role: userRole,
    email: email
  });
  
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      setClasses(data)
      setLoading(false)
      
      // If user is a teacher, fetch their assigned classes (both main and additional)
      if (userRole === "Teacher" && email) {
        fetchTeacherClasses(email);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments");
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  fetchClasses();
  fetchAssignments();
  fetchLearningSets(); 
     setIsPageLoading(false);
}, []);

// Replace fetchTeacherClass with this new function
const fetchTeacherClasses = async (teacherEmail) => {
  try {
    // First find the teacher's user ID
    const userResponse = await fetch("/api/users/find-by-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: teacherEmail })
    });
    
    const userData = await userResponse.json();
    if (!userData || !userData._id) {
      console.log("Could not find teacher user data");
      return;
    }
    
    // Now find all classes this teacher is assigned to
    const classesResponse = await fetch(`/api/classes/teacher/${userData._id}/all-classes`);
    const teacherClasses = await classesResponse.json();
    
    if (teacherClasses && teacherClasses.length > 0) {
      console.log("Found teacher's classes:", teacherClasses.length);
      
      // Store the classes the teacher is assigned to
      setCurrentUser(prev => ({
        ...prev,
        teacherClasses: teacherClasses,
        teacherClassId: teacherClasses.find(c => c.teacherRole === 'main')?._id || teacherClasses[0]._id
      }));
      
      // Load students from ALL classes the teacher is assigned to
      await fetchAllTeacherStudents(teacherClasses);
      
      // Optionally, you can still set a selected class for UI purposes
      const primaryClass = teacherClasses.find(c => c.teacherRole === 'main') || teacherClasses[0];
      setSelectedClass(primaryClass);
    } else {
      console.log("No classes assigned to this teacher");
      message.info("You don't have any classes assigned yet.");
    }
  } catch (error) {
    console.error("Error finding teacher's classes:", error);
  }
};
// Add this new function to fetch students from all assigned classes for a teacher
// Updated fetchAllTeacherStudents function
const fetchAllTeacherStudents = async (teacherClasses) => {
  if (!teacherClasses || teacherClasses.length === 0) {
    setStudents([]);
    setFilteredStudents([]);
    return Promise.resolve();
  }

  try {
    // Create an array to hold all students
    let allStudents = [];
    
    // Fetch students from each class the teacher is assigned to
    for (const classItem of teacherClasses) {
      const response = await fetch(`/api/classes/${classItem._id}`);
      const classData = await response.json();
      
      // Map the students with their class info
      if (classData.students && Array.isArray(classData.students)) {
        const classStudents = classData.students.map((student) => ({
          ...student,
          key: student._id,
          fullName: `${student.firstName} ${student.lastName}`,
          class: classData.className,
          classId: classData._id,
          term: student.term || "Term 1",
          assessmentType: student.assessmentType || "",
          tags: student.tags || ["hardworking"],
        }));
        allStudents = [...allStudents, ...classStudents];
      }
    }
    
    console.log(`Total students from ${teacherClasses.length} classes:`, allStudents.length);
    setStudents(allStudents);
    setFilteredStudents(allStudents);
    return Promise.resolve();
  } catch (error) {
    console.error("Error fetching teacher's students:", error);
    return Promise.reject(error);
  }
};

// Updated toggleClassView function
const toggleClassView = async (classId) => {
  setClassLoading(true);
  
  try {
    if (!classId || classId === 'all') {
      // View all classes the teacher is assigned to
      setSelectedClass(null); // Set to null first to ensure UI updates
      await fetchAllTeacherStudents(currentUser.teacherClasses);
    } else {
      // View a specific class
      await handleClassChange(classId);
    }
  } catch (error) {
    console.error("Error toggling class view:", error);
  } finally {
    setClassLoading(false);
  }
};



  useEffect(() => {
    console.log(
      "Students changed, setting filtered students:",
      students.length
    );
    setFilteredStudents(students);
  }, [students]);

  const handleSearch = (value) => {
    console.log("Search triggered with:", value);
    console.log("Current students count:", students.length);

    setSearchQuery(value);

    if (!value) {
      console.log("Empty search, showing all students");
      setFilteredStudents(students);
      return;
    }

    const lowercasedQuery = value.toLowerCase();
    console.log("Lowercase query:", lowercasedQuery);

    const filtered = students.filter((student) => {
      const firstNameMatch =
        student.firstName &&
        student.firstName.toLowerCase().includes(lowercasedQuery);
      const lastNameMatch =
        student.lastName &&
        student.lastName.toLowerCase().includes(lowercasedQuery);
      const fullNameMatch =
        student.fullName &&
        student.fullName.toLowerCase().includes(lowercasedQuery);
      const classMatch =
        student.class && student.class.toLowerCase().includes(lowercasedQuery);

      return firstNameMatch || lastNameMatch || fullNameMatch || classMatch;
    });

    console.log("Filtered students count:", filtered.length);
    setFilteredStudents(filtered);
  };

  const fetchAllStudents = async () => {
    // Only allow admin to fetch all students
    if (currentUser.role !== "Admin") {
      message.error("You don't have permission to view all students");
      return;
    }
    
    setLoading(true)
    try {
      const response = await fetch("/api/classes");
      const allClasses = await response.json();

      setSelectedClass(null);

      const allStudents = [];

      allClasses.forEach((classItem) => {
        if (classItem.students && Array.isArray(classItem.students)) {
          const classStudents = classItem.students.map((student) => ({
            ...student,
            key: student._id,
            fullName: `${student.firstName} ${student.lastName}`,
            class: classItem.className, // Store the class name
            classId: classItem._id, // Store the class ID for editing/transferring
            term: student.term || "Term 1",
            assessmentType: student.assessmentType || "",
            tags: student.tags || ["hardworking"],
          }));
          allStudents.push(...classStudents);
        }
      });

      console.log("Total students loaded:", allStudents.length);
      setStudents(allStudents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all students:", error);
      setLoading(false);
    }
  };

  const handleClassChange = async (classId) => {
  setClassLoading(true);
  try {
    if (classId === "all") {
      await fetchAllStudents();
      setClassLoading(false);
      return;
    }

    const response = await fetch(`/api/classes/${classId}`);
    const data = await response.json();
    setSelectedClass(data);
    // Map the students data to include all necessary fields
    const mappedStudents = data.students.map((student) => ({
      ...student,
      key: student._id,
      fullName: `${student.firstName} ${student.lastName}`,
      class: data.className,
      classId: data._id, // Store the class ID consistently
      term: student.term || "Term 1",
      assessmentType: student.assessmentType || "",
      tags: student.tags || ["hardworking"],
    }));
    setStudents(mappedStudents);
  } catch (error) {
    console.error("Error fetching class data:", error);
  } finally {
    setClassLoading(false);
  }
};

  // Add this function to let teachers switch between classes they're assigned to
const switchClass = (classId) => {
  if (classId) {
    handleClassChange(classId);
  }
};

  // New function to navigate to student profile
  const navigateToStudentProfile = (student) => {
    if (student && student._id) {
      const classId = student.classId || (selectedClass && selectedClass._id);
      if (classId) {
        navigate(`/class/${classId}/student/${student._id}`);
      } else {
        message.error("Cannot navigate to student profile: missing class ID");
      }
    } else {
      message.error("Cannot navigate to student profile: missing student ID");
    }
  };

  const handleEdit = (record) => {
    console.log("Editing student:", record); // Debug log
    setEditingStudent(record);

    // In "All Students" view, we need to set the selectedClass for this specific student
    if (!selectedClass && record.classId) {
      const studentClass = classes.find((c) => c._id === record.classId);
      if (studentClass) {
        setSelectedClass(studentClass);
      }
    }

    // Only set firstName, lastName, and transferToClass (removed term, assessmentType, tags)
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      transferToClass: "", // Initialize transfer dropdown to empty
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleTransferStudent = async (studentId, oldClassId, newClassId) => {
  // Allow both admin and teacher to transfer students
  if (currentUser.role !== "Admin" && currentUser.role !== "Teacher") {
    message.error("You don't have permission to transfer students");
    return;
  }
  
  try {
    // Add check to ensure that for teachers, they're only transferring from classes they have access to
    if (currentUser.role === "Teacher") {
      const hasAccessToOldClass = currentUser.teacherClasses?.some(c => c._id === oldClassId);
      if (!hasAccessToOldClass) {
        message.error("You don't have permission to transfer students from this class");
        return;
      }
    }
    
    console.log("Transferring student:", studentId, "from class:", oldClassId, "to class:", newClassId);
    
    const response = await fetch("/api/classes/transfer-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // Add token for authorization
      },
      body: JSON.stringify({ 
        studentId, 
        oldClassId, 
        newClassId,
        teacherEmail: currentUser.email // Send teacher email for verification
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to transfer student");
    }

    message.success("Student transferred successfully");

    // Refresh student data
    if (!selectedClass) {
      await fetchAllTeacherStudents(currentUser.teacherClasses);
    } else {
      // Refresh the current class
      await handleClassChange(selectedClass._id);
    }

    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  } catch (error) {
    console.error("Error transferring student:", error);
    message.error(error.message || "Error transferring student");
  }
};

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const wasAllStudentsView = selectedClass === null

      if (values.transferToClass) {
        // For "All Students" view, we need the classId from the student record
        const oldClassId = selectedClass ? selectedClass._id : editingStudent.classId
        await handleTransferStudent(editingStudent._id, oldClassId, values.transferToClass)
        return // Exit early as transfer handles the rest
      }

      if (!assignments || assignments.length === 0) {
        console.error("No assignments available");
      }

      console.log("Form values:", values); // Debug log
      console.log(
        "Selected class ID:",
        selectedClass ? selectedClass._id : editingStudent.classId
      );
      console.log("Editing student ID:", editingStudent._id);

      // Keep existing student data - don't change anything if just viewing/transferring
      const updatedStudent = {
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        // Keep the existing values for these fields (don't update them)
        term: editingStudent.term || "Term 1",
        assessmentType: editingStudent.assessmentType || "",
        tags: editingStudent.tags || ["hardworking"],
      }

      console.log("Sending updated student data:", updatedStudent) // Debug log
      const classId = selectedClass ? selectedClass._id : editingStudent.classId

      const response = await fetch(
        `/api/classes/${classId}/students/${editingStudent._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStudent),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error("Failed to update student");
      }

      const updatedStudentData = await response.json();
      console.log("Received updated student data:", updatedStudentData); // Debug log

      if (wasAllStudentsView) {
        await fetchAllStudents();
      } else {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === editingStudent._id
              ? {
                  ...student,
                  ...updatedStudentData,
                  fullName: `${updatedStudentData.firstName} ${updatedStudentData.lastName}`,
                }
              : student
          )
        );
      }

      setIsModalVisible(false);
      setEditingStudent(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <a onClick={() => navigateToStudentProfile(record)}>{text}</a>
      ),
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    // {
    //   title: "Term",
    //   dataIndex: "term",
    //   key: "term",
    // },
    {
      title: "Actions",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <button
            className="action-button edit-button"
            onClick={() => handleEdit(record)}
          >
            Edit
          </button>
          <StudentAssessmentView
            student={record}
            classId={record.classId || selectedClass?._id}
            className="action-button view-button"
          />
        </Space>
      ),
    },
  ];

  const contentStyle = {
    margin: 0,
    height: "200px",
    color: "#fff",
    lineHeight: "200px",
    textAlign: "center",
    background: "#326C6F",
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  // date
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const getTimeBasedGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) {
      return "Good morning";
    } else if (hours >= 12 && hours < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>My Dashboard</h2>
        <Link to="/create-assignment" className="button">
          + Create New Assessments
        </Link>
        {/* <Link to="/view-assignments" className="button">
          View Assignments
        </Link> */}
        <Link to="/edit-tags" className="button">
          Edit Tags
        </Link>
      </div>
      <div className="main-content">
      <div className="content-container">
  <div className="greeting-container">
    <div className="logo-container">
      <Logo />
    </div>
    <div className="welcome-tags">
  {/* For teachers, show simplified class options */}
  {currentUser.role === "Teacher" && currentUser.teacherClasses && (
    <>
      {/* Add instructional prompt */}
      <div 
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "12px", 
    fontSize: "0.95rem", 
    color: "#326c6f",
  }}
>
  <span 
    style={{ 
      fontWeight: "700", 
      borderBottom: "2px solid #E9AF0C",
      paddingBottom: "2px",
      marginRight: "10px"
    }}
  >
    FILTER:
  </span>
</div>

      {/* All My Classes option */}
      <Tag 
  color={!selectedClass ? "red" : "default"}
  style={{cursor: "pointer"}}
  onClick={() => toggleClassView('all')}
  icon={classLoading && !selectedClass ? <LoadingOutlined /> : null}
>
  {classLoading && !selectedClass ? "Loading..." : "All My Classes"}
</Tag>

{/* Only show main classes and co-teacher classes with simplified labels */}
{currentUser.teacherClasses.map(classItem => (
  <Tag 
    key={classItem._id} 
    color={selectedClass && selectedClass._id === classItem._id 
      ? (classItem.teacherRole === 'main' ? "purple" : "blue") 
      : (classItem.teacherRole === 'main' ? "purple-inverse" : "blue-inverse")
    }
    style={{cursor: "pointer"}}
    onClick={() => toggleClassView(classItem._id)}
    icon={classLoading && selectedClass && selectedClass._id === classItem._id 
      ? <LoadingOutlined /> : null}
  >
    {classLoading && selectedClass && selectedClass._id === classItem._id 
      ? "Loading..." 
      : `${classItem.className} ${classItem.teacherRole === 'main' ? "(Main)" : "(Co-Teacher)"}`}
  </Tag>
      ))}
    </>
  )}
</div>
    <div className="dummy-data">
        <p style={{ fontSize: "1.4rem" }}>{getTimeBasedGreeting()}, <strong>{currentUser.name}</strong></p>
        <p style={{ fontSize: "1.0rem" }}><strong>{currentDate}</strong></p>
          </div>
        </div>
        <hr className="divider" style={{ borderColor: "#E9AF0C" }} />
      </div>
          <div className="boxes-container">
            <div className="boxes">
            <div className="box">
  <Carousel arrows infinite={false}>
    <div>
      <h3 className="watermarked" style={{ fontSize: "1.3rem" }}>
        {/* When selectedClass is null, show all classes the teacher is assigned to */}
        {!selectedClass ? "All My Classes" : `Class ${selectedClass.className}`}
      </h3>
    </div>
    <div>
      <h3 className="watermarked" style={{ fontSize: "1.3rem" }}>
        {filteredStudents.length} Students
      </h3>
    </div>
    {/* Add a third slide to show class breakdown */}
    {currentUser.role === "Teacher" && currentUser.teacherClasses && currentUser.teacherClasses.length > 1 && (
      <div>
        <h3 className="watermarked" style={{ fontSize: "1.3rem" }}>
          Class Breakdown:
          {currentUser.teacherClasses.map(c => 
            <div key={c._id} style={{fontSize: "0.9rem", margin: "3px 0"}}>
              {c.className}: {students.filter(s => s.classId === c._id).length} students
            </div>
          )}
        </h3>
      </div>
    )}
  </Carousel>
</div>
      <div className="box">
  <Carousel arrows infinite={false}>
    {learningSets.length > 0 ? (
      learningSets.map(subject => (
        <div key={subject._id}>
          <h3 className="watermarked" style={{ fontSize: "1.3rem" }}>
            <div style={{ 
              fontSize: "1.1rem", 
              fontWeight: "bold", 
              marginBottom: "10px",
              color: "#E9AF0C"
            }}>
              Current Learning Sets
            </div>
            {subject.name}
          </h3>
        </div>
      ))
    ) : (
      <div>
        <h3 className="watermarked" style={{ fontSize: "1.3rem" }}>
          <div style={{ 
            fontSize: "1.1rem", 
            fontWeight: "bold", 
            marginBottom: "10px",
            color: "white" 
          }}>
            Current Learning Sets
          </div>
          Loading Learning sets...
        </h3>
      </div>
    )}
  </Carousel>
</div>
            </div>
          </div>
          <div className="content-container">
            <div className="filter-controls">
          {/* Only show class selector for Admins */}
            {currentUser.role === "Admin" && (
              <div>
                <h2 className="students-title">Select Class</h2>
                <Select style={{ width: 200 }} placeholder="Select a class" onChange={handleClassChange}>
                  <Option key="all" value="all">
                    All Students
                  </Option>
                  {classes.map((classItem) => (
                    <Option key={classItem._id} value={classItem._id}>
                      {classItem.className}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            
          </div>

          <div className="massive-box-container">
  <div className="massive-box">
    <div className="search-header">
      <h2 className="students-title">Search Students</h2>
      <Search
        placeholder="Search by name..."
        allowClear
        enterButton={
          <Button
            style={{
              backgroundColor: "#326c6f",
              borderColor: "#326c6f",
            }}
          >
            <SearchOutlined style={{ color: "white" }} />
          </Button>
        }
        style={{ width: 300 }}
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
    
    <Spin spinning={classLoading} tip="Loading students...">
      <Table
        columns={columns}
        dataSource={filteredStudents}
        locale={{ emptyText: "No students found" }}
      />
    </Spin>
  </div>
</div>
        </div>
      </div>
      <Modal
        title="Edit Student"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" initialValues={editingStudent}>
          <Form.Item name="firstName" label="First Name">
            <Input disabled defaultValue={editingStudent?.firstName} />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name">
            <Input disabled defaultValue={editingStudent?.lastName} />
          </Form.Item>

          {/* Show warning to both admins and teachers */}
{(currentUser.role === "Admin" || currentUser.role === "Teacher") && (
  <div style={{ marginBottom: "12px", color: "#ff4d4f", fontSize: "14px" }}>
    <strong>Warning:</strong> Transferring a student will move all their assessments and data to the selected
    class.
  </div>
)}

{/* Allow both admins and teachers to transfer students */}
{(currentUser.role === "Admin" || currentUser.role === "Teacher") && (
  <Form.Item name="transferToClass" label="Transfer To Class">
    <Select placeholder="Select class to transfer student (optional)">
      <Option value="">-- No Transfer --</Option>
      {classes
        .filter((classItem) => {
          if (!selectedClass && editingStudent) {
            return classItem._id !== editingStudent.classId
          }
          return classItem._id !== selectedClass?._id
        })
        .map((classItem) => (
          <Option key={classItem._id} value={classItem._id}>
            {classItem.className}
          </Option>
        ))}
    </Select>
  </Form.Item>
)}
          
          {/* Removed term, assessmentType, and tags form fields */}
        </Form>
      </Modal>
    </div>
  )
}

export default Assessments
