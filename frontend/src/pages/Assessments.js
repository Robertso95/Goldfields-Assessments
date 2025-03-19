import { useState, useEffect } from "react"
import { Space, Table, Tag, Carousel, Select, Modal, Form, Input, Button, message } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import StudentAssessmentView from "../components/StudentAssessmentView"
import { Link, useNavigate } from "react-router-dom"
import "../assessments.css"

const { Option } = Select
const { Search } = Input

const Assessments = () => {
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

  const getTagColor = (tag) => {
    switch (tag.toLowerCase()) {
      case "hardworking":
        return "green"
      case "dedicated":
        return "blue"
      case "focused":
        return "orange"
      case "creative":
        return "purple"
      case "team player":
        return "cyan"
      case "determined":
        return "gold"
      case "improving":
        return "lime"
      case "brilliant":
        return "geekblue"
      case "leadership":
        return "red"
      default:
        return tag.length > 5 ? "geekblue" : "green" // Default color based on length
    }
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes")
        const data = await response.json()
        setClasses(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching classes:", error)
        setLoading(false)
      }
    }

    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/assignments")
        const data = await response.json()
        setAssignments(data)
      } catch (error) {
        console.error("Error fetching assignments:", error)
      }
    }

    fetchClasses()
    fetchAssignments()
  }, [])

  useEffect(() => {
    console.log("Students changed, setting filtered students:", students.length)
    setFilteredStudents(students)
  }, [students])

  const handleSearch = (value) => {
    console.log("Search triggered with:", value)
    console.log("Current students count:", students.length)

    setSearchQuery(value)

    if (!value) {
      console.log("Empty search, showing all students")
      setFilteredStudents(students)
      return
    }

    const lowercasedQuery = value.toLowerCase()
    console.log("Lowercase query:", lowercasedQuery)

    const filtered = students.filter((student) => {
      const firstNameMatch = student.firstName && student.firstName.toLowerCase().includes(lowercasedQuery)
      const lastNameMatch = student.lastName && student.lastName.toLowerCase().includes(lowercasedQuery)
      const fullNameMatch = student.fullName && student.fullName.toLowerCase().includes(lowercasedQuery)
      const classMatch = student.class && student.class.toLowerCase().includes(lowercasedQuery)

      return firstNameMatch || lastNameMatch || fullNameMatch || classMatch
    })

    console.log("Filtered students count:", filtered.length)
    setFilteredStudents(filtered)
  }

  const fetchAllStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/classes")
      const allClasses = await response.json()

      setSelectedClass(null)

      const allStudents = []

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
          }))
          allStudents.push(...classStudents)
        }
      })

      console.log("Total students loaded:", allStudents.length)
      setStudents(allStudents)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching all students:", error)
      setLoading(false)
    }
  }

  const handleClassChange = async (classId) => {
    if (classId === "all") {
      await fetchAllStudents()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/classes/${classId}`)
      const data = await response.json()
      setSelectedClass(data)
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
      }))
      setStudents(mappedStudents)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching class data:", error)
      setLoading(false)
    }
  }

  // New function to navigate to student profile
  const navigateToStudentProfile = (student) => {
    if (student && student._id) {
      const classId = student.classId || (selectedClass && selectedClass._id)
      if (classId) {
        navigate(`/class/${classId}/student/${student._id}`)
      } else {
        message.error("Cannot navigate to student profile: missing class ID")
      }
    } else {
      message.error("Cannot navigate to student profile: missing student ID")
    }
  }

  const handleEdit = (record) => {
    console.log("Editing student:", record) // Debug log
    setEditingStudent(record)

    // In "All Students" view, we need to set the selectedClass for this specific student
    if (!selectedClass && record.classId) {
      const studentClass = classes.find((c) => c._id === record.classId)
      if (studentClass) {
        setSelectedClass(studentClass)
      }
    }

    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      term: record.term || "Term 1",
      assessmentType: record.assessmentType || "",
      tags: record.tags ? record.tags.join(", ") : "",
      transferToClass: "", // Initialize transfer dropdown to empty
    })
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingStudent(null)
    form.resetFields()
  }

  const handleTransferStudent = async (studentId, oldClassId, newClassId) => {
    try {
      const response = await fetch("/api/classes/transfer-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, oldClassId, newClassId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to transfer student")
      }

      message.success("Student transferred successfully")

      const wasAllStudentsView = selectedClass === null

      if (wasAllStudentsView) {
        await fetchAllStudents()
      } else {
        setStudents((prevStudents) => prevStudents.filter((student) => student._id !== studentId))
      }

      setIsModalVisible(false)
      setEditingStudent(null)
      form.resetFields()
    } catch (error) {
      console.error("Error transferring student:", error)
      message.error(error.message || "Error transferring student")
    }
  }

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
        console.error("No assignments available")
      }

      console.log("Form values:", values) // Debug log
      console.log("Selected class ID:", selectedClass ? selectedClass._id : editingStudent.classId)
      console.log("Editing student ID:", editingStudent._id)

      const updatedStudent = {
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        assessmentType: values.assessmentType, 
        term: values.term,
        tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()) : ["hardworking"],
      }

      console.log("Sending updated student data:", updatedStudent) // Debug log

     
      const classId = selectedClass ? selectedClass._id : editingStudent.classId

      const response = await fetch(`/api/classes/${classId}/students/${editingStudent._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error response:", errorData)
        throw new Error("Failed to update student")
      }

      const updatedStudentData = await response.json()
      console.log("Received updated student data:", updatedStudentData) // Debug log

      if (wasAllStudentsView) {
        await fetchAllStudents()
      } else {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === editingStudent._id
              ? {
                  ...student,
                  ...updatedStudentData,
                  fullName: `${updatedStudentData.firstName} ${updatedStudentData.lastName}`,
                  assessmentType: updatedStudentData.assessmentType,
                }
              : student,
          ),
        )
      }

      setIsModalVisible(false)
      setEditingStudent(null)
      form.resetFields()
    } catch (error) {
      console.error("Error saving student:", error)
    }
  }

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => <a onClick={() => navigateToStudentProfile(record)}>{text}</a>,
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Term",
      dataIndex: "term",
      key: "term",
    },
    {
      title: "Assessment Type",
      dataIndex: "assessmentType",
      key: "assessmentType",
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (tags) => (
        <>
          {tags &&
            tags.map((tag) => {
              const color = getTagColor(tag)
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              )
            })}
        </>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <button className="action-button edit-button" onClick={() => handleEdit(record)}>
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
  ]

  const contentStyle = {
    margin: 0,
    height: "200px",
    color: "#fff",
    lineHeight: "200px",
    textAlign: "center",
    background: "#326C6F",
  }

  if (loading) {
    return <div>Loading...</div>
  }

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
        <div className="content-container">
          <div className="dummy-data">
            <p>Hello, Admin</p>
            <p>Goldfields School 01/01/2025</p>
          </div>
          <hr className="divider" />
        </div>
        <div className="boxes-container">
          <div className="boxes">
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>{selectedClass ? selectedClass.className : "All Classes"}</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>{filteredStudents.length} Students</h3>
                </div>
              </Carousel>
            </div>
            <div className="box">
              <Carousel arrows infinite={false}>
                <div>
                  <h3 style={contentStyle}>Assignment Now</h3>
                </div>
                <div>
                  <h3 style={contentStyle}>Assignment due</h3>
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
        <div className="content-container">
          <div className="filter-controls">
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

            <div>
              <h2 className="students-title">Search Students</h2>
              <Search
                placeholder="Search by name..."
                allowClear
                enterButton={
                  <Button Style={{backgroundColor: '#326c6f', borderColor: '#326c6f'}}>
                    <SearchOutlined style={{color:'white'}}/>
                  </Button>
                }
                style={{ width: 250 }}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="massive-box-container">
            <div className="massive-box">
              <Table columns={columns} dataSource={filteredStudents} locale={{ emptyText: "No students found" }} />
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

          <div style={{ marginBottom: "12px", color: "#ff4d4f", fontSize: "14px" }}>
            <strong>Warning:</strong> Transferring a student will move all their assessments and data to the selected
            class.
          </div>

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
        </Form>
      </Modal>
    </div>
  )
}

export default Assessments

