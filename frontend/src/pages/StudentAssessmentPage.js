import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spin, Button, Table, Space, Modal, message, Empty, Tooltip, Select, Row, Col } from "antd"
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, FilterOutlined } from "@ant-design/icons"
import axios from "axios"
import "../StudentAssessmentPage.css"

const { confirm } = Modal
const { Option } = Select

const StudentAssessmentPage = () => {
  const { classId, studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [learningSets, setLearningSets] = useState([])
  const [assignmentTypes, setAssignmentTypes] = useState([])
  const [tags, setTags] = useState([])
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [uniqueSubjects, setUniqueSubjects] = useState([])
  const [tagMap, setTagMap] = useState({}) // Add a state for tag mapping

  // Function to simplify subject names
  const simplifySubjectName = (fullSubjectName) => {
    // Map of common subject patterns to simplified names
    const subjectMappings = {
      "Te Ara Whakapuawai - Reading": "Reading",
      Reading: "Reading",
      Literacy: "Reading",
      English: "Reading",
      "Te Ara Whakapuawai - Writing": "Writing",
      Writing: "Writing",
      "Te Ara Whakapuawai - Mathematics": "Numeracy",
      Mathematics: "Numeracy",
      Math: "Numeracy",
      Maths: "Numeracy",
      Numeracy: "Numeracy",
      Science: "Science",
      "Social Studies": "Social Studies",
      "Physical Education": "Physical Education",
      PE: "Physical Education",
      Art: "Art",
      Music: "Music",
      Technology: "Technology",
      Languages: "Languages",
      "Te Reo Māori": "Te Reo Māori",
    }

    // Check if we have a direct mapping
    if (subjectMappings[fullSubjectName]) {
      return subjectMappings[fullSubjectName]
    }

    // Check for partial matches
    for (const [pattern, simplified] of Object.entries(subjectMappings)) {
      if (fullSubjectName.toLowerCase().includes(pattern.toLowerCase())) {
        return simplified
      }
    }

    // If no match found, return the original name
    return fullSubjectName
  }

  // Fetch reference data for display purposes
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch learning sets (subjects)
        const learningSetsResponse = await axios.get("/api/learningsets")
        if (learningSetsResponse.status === 200) {
          setLearningSets(learningSetsResponse.data)
        }

        // Fetch assignment types
        const assignmentTypesResponse = await axios.get("/api/assignmenttype")
        if (assignmentTypesResponse.status === 200) {
          setAssignmentTypes(assignmentTypesResponse.data)
        }

        // Fetch tags
        const tagsResponse = await axios.get("/api/tags")
        if (tagsResponse.status === 200) {
          setTags(tagsResponse.data)

          // Create a mapping of tag IDs to tag names
          const tagMapping = {}
          tagsResponse.data.forEach((tag) => {
            tagMapping[tag._id] = tag.name
          })
          setTagMap(tagMapping)
        }
      } catch (error) {
        console.error("Error fetching reference data:", error)
      }
    }

    fetchReferenceData()
  }, [])

  const fetchAssignments = async () => {
    try {
      // Fetch all assignments
      const assignmentsResponse = await axios.get("/api/assignments")

      if (assignmentsResponse.status === 200) {
        // Filter assignments for this student
        const studentAssignments = assignmentsResponse.data.filter((assignment) => {
          return (
            assignment.studentNames === studentId ||
            (Array.isArray(assignment.studentNames) && assignment.studentNames.includes(studentId))
          )
        })

        console.log("Filtered assignments:", studentAssignments)

        // Fetch all reference data at once to avoid multiple API calls
        const [allSubjects, allAssignments, allTags] = await Promise.all([
          axios.get("/api/learningsets"),
          axios.get("/api/assignmenttype"),
          axios.get("/api/tags"),
        ])

        // Create lookup maps for faster access
        const subjectMap = {}
        allSubjects.data.forEach((subject) => {
          subjectMap[subject._id] = subject.name
        })

        const assignmentMap = {}
        allAssignments.data.forEach((assignment) => {
          assignmentMap[assignment._id] = assignment.name
        })

        const tagMap = {}
        allTags.data.forEach((tag) => {
          tagMap[tag._id] = tag.name
        })

        // Update the tag map state
        setTagMap(tagMap)

        // Enrich assignments with names from the lookup maps
        const enrichedAssignments = studentAssignments.map((assignment) => {
          const fullSubjectName = subjectMap[assignment.subject] || "Unknown Subject"
          const simplifiedSubjectName = simplifySubjectName(fullSubjectName)

          return {
            ...assignment,
            subjectName: fullSubjectName,
            simplifiedSubject: simplifiedSubjectName, // Add simplified subject name
            assignmentName: assignmentMap[assignment.assignment] || "Unknown Assignment",
            tagNames: Array.isArray(assignment.tags)
              ? assignment.tags.map((tagId) => tagMap[tagId] || `Tag ${tagId}`)
              : [],
          }
        })

        setAssignments(enrichedAssignments)
        setFilteredAssignments(enrichedAssignments)

        // Extract unique simplified subjects for the filter
        const subjects = new Set()
        enrichedAssignments.forEach((assignment) => {
          if (assignment.simplifiedSubject) {
            subjects.add(assignment.simplifiedSubject)
          }
        })
        setUniqueSubjects(Array.from(subjects))
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
      message.error("Failed to load assignments")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch student details
        const studentResponse = await axios.get(`/api/classes/${classId}/students/${studentId}`)
        setStudent(studentResponse.data)

        // Fetch assignments separately
        await fetchAssignments()
      } catch (error) {
        console.error("Error fetching data:", error)
        message.error("Failed to load student data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [classId, studentId])

  // Apply subject filter when it changes
  useEffect(() => {
    if (subjectFilter === "all") {
      setFilteredAssignments(assignments)
    } else {
      const filtered = assignments.filter((assignment) => assignment.simplifiedSubject === subjectFilter)
      setFilteredAssignments(filtered)
    }
  }, [subjectFilter, assignments])

  const handleBack = () => {
    navigate(-1)
  }

  const handleEditAssignment = (assignmentId) => {
    // Navigate to the create assignment page with the assignment ID
    navigate(`/create-assignment?edit=${assignmentId}&studentId=${studentId}&classId=${classId}`)
  }

  // Updated to use the new delete endpoint
  const handleDeleteAssignment = (assignmentId) => {
    confirm({
      title: "Are you sure you want to delete this assignment?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true)
          console.log("Deleting assignment with ID:", assignmentId)

          const response = await axios.delete(`/api/assignments/${assignmentId}`)
          console.log("Delete response:", response)

          if (response.status === 200) {
            // Remove from local state
            const updatedAssignments = assignments.filter((a) => a._id !== assignmentId)
            setAssignments(updatedAssignments)
            setFilteredAssignments(
              updatedAssignments.filter((a) => subjectFilter === "all" || a.simplifiedSubject === subjectFilter),
            )

            message.success("Assignment deleted successfully")
          } else {
            throw new Error(`Unexpected response status: ${response.status}`)
          }
        } catch (error) {
          console.error("Error deleting assignment:", error)
          const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message
          message.error(`Failed to delete assignment: ${errorMsg}`)
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // Handle subject filter change
  const handleSubjectFilterChange = (value) => {
    setSubjectFilter(value)
  }

  // Format the date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Improved function to extract tag prefix
  const getTagPrefix = (tagName) => {
    if (!tagName) return ""

    // Check for common tag patterns

    // Pattern 1: "READ/AP 1A: ..." or "READ/R 1A"
    const readMatch = tagName.match(/^(READ\/[A-Z]+\s+\d+[A-Z]*)/)
    if (readMatch) return readMatch[1]

    // Pattern 2: "WRITE/ENG 1B" or similar
    const writeMatch = tagName.match(/^(WRITE\/[A-Z]+\s+\d+[A-Z]*)/)
    if (writeMatch) return writeMatch[1]

    // Pattern 3: "NumN/E 1A." or "Num/N L4.14."
    const numMatch = tagName.match(/^(Num[A-Z]*\/[A-Z]+\s+[A-Z0-9.]+)/)
    if (numMatch) return numMatch[1]

    // If no specific pattern matches, try to get the first part before a period, colon, or semicolon
    const generalMatch = tagName.match(/^([^.;:]+)/)
    if (generalMatch) {
      // Limit to first 15 characters if it's too long
      const prefix = generalMatch[1].trim()
      return prefix.length > 15 ? prefix.substring(0, 15) + "..." : prefix
    }

    // Fallback: return first 15 chars if nothing else works
    return tagName.length > 15 ? tagName.substring(0, 15) + "..." : tagName
  }

  const columns = [
    {
      title: "Subject",
      dataIndex: "simplifiedSubject", // Use simplified subject name in the table
      key: "simplifiedSubject",
      render: (text) => text || "N/A",
    },
    {
      title: "Assignment",
      dataIndex: "assignmentName",
      key: "assignmentName",
      render: (text) => text || "N/A",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tagIds, record) => {
        if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
          return "No tags"
        }

        return (
          <div className="tag-container">
            {tagIds.map((tagId) => {
              // Get the full tag name from the mapping
              const fullTagName = tagMap[tagId] || `Tag ${tagId}`
              // Get just the prefix using our improved function
              const tagPrefix = getTagPrefix(fullTagName)

              return (
                <Tooltip key={tagId} title={fullTagName}>
                  <span className="assignment-tag">{tagPrefix}</span>
                </Tooltip>
              )
            })}
          </div>
        )
      },
    },
    {
      title: "Completed Date",
      dataIndex: "completedDate",
      key: "completedDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Additional Comments",
      dataIndex: "additionalComments",
      key: "additionalComments",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditAssignment(record._id)}>
            Edit
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAssignment(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading student data..." />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="error-container">
        <h2>Student not found</h2>
        <p>Could not find student information. Please try again.</p>
        <Button type="primary" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="student-page-container">
      <div className="student-header">
        <Button className="back-button" onClick={handleBack}>
          Back
        </Button>
        <h1>Student Assignments</h1>
        {/* Removed the Create New Assignment button as requested */}
      </div>

      <div className="student-profile-section">
        <div className="student-avatar">
          {student.image ? (
            <img src={student.image || "/placeholder.svg"} alt={`${student.firstName} ${student.lastName}`} />
          ) : (
            <div className="avatar-placeholder">
              {student.firstName.charAt(0)}
              {student.lastName.charAt(0)}
            </div>
          )}
        </div>
        <div className="student-name">
          <h2>
            {student.firstName} {student.lastName}
          </h2>
          <p className="student-class">{student.class}</p>
        </div>
      </div>

      <div className="assignments-section">
        <Row className="filter-row" align="middle" justify="space-between">
          <Col>
            <h2>Assignments</h2>
          </Col>
          <Col>
            <div className="filter-container">
              <FilterOutlined className="filter-icon" />
              <Select
                defaultValue="all"
                style={{ width: 200 }}
                onChange={handleSubjectFilterChange}
                placeholder="Filter by subject"
              >
                <Option value="all">All Subjects</Option>
                {uniqueSubjects.map((subject) => (
                  <Option key={subject} value={subject}>
                    {subject}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        {filteredAssignments.length > 0 ? (
          <Table columns={columns} dataSource={filteredAssignments} rowKey="_id" pagination={{ pageSize: 10 }} />
        ) : (
          <Empty
            description={
              subjectFilter === "all"
                ? "No assignments found for this student"
                : `No assignments found for subject: ${subjectFilter}`
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  )
}

export default StudentAssessmentPage
