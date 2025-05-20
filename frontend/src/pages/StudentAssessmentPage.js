import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spin, Button, Table, Space, Modal, message, Empty, Tooltip, Select, Row, Col, Image, Typography } from "antd"
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  PrinterOutlined,
  FileImageOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons"
import axios from "axios"
import "../StudentAssessmentPage.css"

const { confirm } = Modal
const { Option } = Select
const { Title, Text } = Typography

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
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false)
  const [currentEvidence, setCurrentEvidence] = useState([])
  const [currentAssignment, setCurrentAssignment] = useState(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0) // Track current slide index

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

        // Fetch assessment types
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
      // Fetch all assessments - IMPORTANT: Keep the original API endpoint
      const assignmentsResponse = await axios.get("/api/assignments")

      if (assignmentsResponse.status === 200) {
        // Filter assessments for this student
        const studentAssignments = assignmentsResponse.data.filter((assignment) => {
          return (
            assignment.studentNames === studentId ||
            (Array.isArray(assignment.studentNames) && assignment.studentNames.includes(studentId))
          )
        })

        console.log("Filtered assessments:", studentAssignments)

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

        // Enrich assessments with names from the lookup maps
        const enrichedAssignments = studentAssignments.map((assignment) => {
          const fullSubjectName = subjectMap[assignment.subject] || "Unknown Subject"
          const simplifiedSubjectName = simplifySubjectName(fullSubjectName)

          return {
            ...assignment,
            subjectName: fullSubjectName,
            simplifiedSubject: simplifiedSubjectName, // Add simplified subject name
            assignmentName: assignmentMap[assignment.assignment] || "Unknown Assessment",
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
      console.error("Error fetching assessments:", error)
      message.error("Failed to load assessments")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch student details
        const studentResponse = await axios.get(`/api/classes/${classId}/students/${studentId}`)
        setStudent(studentResponse.data)

        // Fetch assessments separately
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
    // Navigate to the create assessment page with the assessment ID
    navigate(`/create-assignment?edit=${assignmentId}&studentId=${studentId}&classId=${classId}`)
  }

  // Updated to use the new delete endpoint
  const handleDeleteAssignment = (assignmentId) => {
    confirm({
      title: "Are you sure you want to delete this assessment?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true)
          console.log("Deleting assessment with ID:", assignmentId)

          // IMPORTANT: Keep the original API endpoint
          const response = await axios.delete(`/api/assignments/${assignmentId}`)
          console.log("Delete response:", response)

          if (response.status === 200) {
            // Remove from local state
            const updatedAssignments = assignments.filter((a) => a._id !== assignmentId)
            setAssignments(updatedAssignments)
            setFilteredAssignments(
              updatedAssignments.filter((a) => subjectFilter === "all" || a.simplifiedSubject === subjectFilter),
            )

            message.success("Assessment deleted successfully")
          } else {
            throw new Error(`Unexpected response status: ${response.status}`)
          }
        } catch (error) {
          console.error("Error deleting assessment:", error)
          const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message
          message.error(`Failed to delete assessment: ${errorMsg}`)
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

  // Helper function to generate assessment HTML for printing
  const generateAssignmentHtml = (assignment) => {
    // Format tag names with each tag on a new line
    let tagNamesHtml = "No tags"

    if (assignment.tags && Array.isArray(assignment.tags) && assignment.tags.length > 0) {
      const tagList = assignment.tags
        .map((tagId) => {
          const tagName = tagMap[tagId] || `Tag ${tagId}`
          return `<li>${tagName}</li>`
        })
        .join("")

      tagNamesHtml = `<ul class="tag-list">${tagList}</ul>`
    }

    // Generate HTML for a single assessment
    let assignmentHtml = `
      <div class="assessment-container">
        <h2 class="assessment-title">${assignment.assignmentName || "Unnamed Assessment"}</h2>
        
        <div class="section">
          <span class="label">Subject:</span> ${assignment.simplifiedSubject || "N/A"}
        </div>
        
        <div class="section">
          <span class="label">Tags:</span> ${tagNamesHtml}
        </div>
        
        <div class="section">
          <span class="label">Completed Date:</span> ${formatDate(assignment.completedDate)}
        </div>
        
        <div class="section">
          <span class="label">Additional Comments:</span> ${assignment.additionalComments || "N/A"}
        </div>
        
        <div class="section">
          <span class="label">Description:</span> ${assignment.description || "N/A"}
        </div>
    `

    // Add evidence if available
    if (assignment.evidence && assignment.evidence.length > 0) {
      assignmentHtml += `
        <div class="evidence-section">
          <h3>Evidence</h3>
      `

      assignment.evidence.forEach((item, index) => {
        // Check if it's an image (by extension)
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item)
        // Check if it's a video (by extension)
        const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(item)

        assignmentHtml += `
          <div class="evidence-item">
            <div>Evidence Item ${index + 1}:</div>
        `

        if (isImage) {
          // For images, display the actual image
          assignmentHtml += `<img src="${item}" alt="Evidence ${index + 1}" />`
        } else if (isVideo) {
          // For videos, display a video thumbnail with play button overlay
          assignmentHtml += `
            <div class="video-thumbnail">
              <div class="video-placeholder">
                <div class="play-button-overlay">▶</div>
                <div class="video-text">Video: ${item.split("/").pop() || "Video file"}</div>
              </div>
              <div class="video-link">Video URL: <a href="${item}" target="_blank">${item}</a></div>
            </div>
          `
        } else {
          // For other files, just show a link
          assignmentHtml += `<a href="${item}" target="_blank">${item}</a>`
        }

        assignmentHtml += `</div>`
      })

      assignmentHtml += `</div>`
    }

    assignmentHtml += `</div>`
    return assignmentHtml
  }

  // Function to handle printing an assessment
  const handlePrintAssignment = (assignment) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")

    // Create the content for the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Assessment Details - ${assignment.assignmentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
            }
            .evidence-section {
              margin-top: 20px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            .evidence-item {
              margin-bottom: 10px;
            }
            .evidence-item img {
              max-width: 100%;
              max-height: 300px;
              margin-top: 5px;
            }
            .tag-list {
              margin-top: 5px;
              margin-bottom: 5px;
              padding-left: 20px;
            }
            .tag-list li {
              margin-bottom: 8px;
            }
            .video-thumbnail {
              margin-top: 10px;
            }
            .video-placeholder {
              position: relative;
              width: 320px;
              height: 180px;
              background-color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 5px;
            }
            .play-button-overlay {
              position: absolute;
              font-size: 40px;
              color: white;
              background-color: rgba(0, 0, 0, 0.5);
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .video-text {
              position: absolute;
              bottom: 10px;
              left: 10px;
              color: white;
              font-size: 12px;
              background-color: rgba(0, 0, 0, 0.7);
              padding: 5px;
              border-radius: 4px;
              max-width: 90%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .video-link {
              font-size: 12px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Assessment Details</h1>
            <h2>${student ? `${student.firstName} ${student.lastName}` : "Student"}</h2>
          </div>
          
          ${generateAssignmentHtml(assignment)}
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    // Focus the new window
    printWindow.focus()
  }

  // Function to handle printing all assessments
  const handlePrintAllAssignments = () => {
    // Use the currently filtered assessments
    const assessmentsToPrint = filteredAssignments

    if (assessmentsToPrint.length === 0) {
      message.info("No assessments to print")
      return
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank")

    // Create the content for the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>All Assessments - ${student ? `${student.firstName} ${student.lastName}` : "Student"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            .assessment-container {
              margin-bottom: 30px;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              page-break-inside: avoid;
            }
            .assessment-title {
              margin-top: 0;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
              color: #333;
            }
            .section {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
            }
            .evidence-section {
              margin-top: 20px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            .evidence-item {
              margin-bottom: 10px;
            }
            .evidence-item img {
              max-width: 100%;
              max-height: 300px;
              margin-top: 5px;
            }
            .tag-list {
              margin-top: 5px;
              margin-bottom: 5px;
              padding-left: 20px;
            }
            .tag-list li {
              margin-bottom: 8px;
            }
            .video-thumbnail {
              margin-top: 10px;
            }
            .video-placeholder {
              position: relative;
              width: 320px;
              height: 180px;
              background-color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 5px;
            }
            .play-button-overlay {
              position: absolute;
              font-size: 40px;
              color: white;
              background-color: rgba(0, 0, 0, 0.5);
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .video-text {
              position: absolute;
              bottom: 10px;
              left: 10px;
              color: white;
              font-size: 12px;
              background-color: rgba(0, 0, 0, 0.7);
              padding: 5px;
              border-radius: 4px;
              max-width: 90%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .video-link {
              font-size: 12px;
              color: #666;
            }
            .page-break {
              page-break-after: always;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>All Assessments</h1>
            <h2>${student ? `${student.firstName} ${student.lastName}` : "Student"}</h2>
            ${subjectFilter !== "all" ? `<h3>Subject: ${subjectFilter}</h3>` : ""}
            <p>Total Assessments: ${assessmentsToPrint.length}</p>
          </div>
    `)

    // Add each assessment to the print window
    assessmentsToPrint.forEach((assignment, index) => {
      printWindow.document.write(generateAssignmentHtml(assignment))

      // Add a page break after each assessment except the last one
      if (index < assessmentsToPrint.length - 1) {
        printWindow.document.write('<div class="page-break"></div>')
      }
    })

    // Add print button and close the HTML
    printWindow.document.write(`
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    // Focus the new window
    printWindow.focus()
  }

  // Function to handle showing evidence
  const handleShowEvidence = (assignment) => {
    if (assignment.evidence && assignment.evidence.length > 0) {
      setCurrentEvidence(assignment.evidence)
      setCurrentAssignment(assignment)
      setCurrentSlideIndex(0) // Reset to first slide
      setEvidenceModalVisible(true)
    } else {
      message.info("No evidence available for this assessment")
    }
  }

  // Function to navigate to the next slide
  const nextSlide = () => {
    if (currentSlideIndex < currentEvidence.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  // Function to navigate to the previous slide
  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  // Function to determine if a URL is an image
  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url)
  }

  // Function to determine if a URL is a video
  const isVideoUrl = (url) => {
    return /\.(mp4|webm|ogg|mov|avi)$/i.test(url)
  }

  const columns = [
    {
      title: "Subject",
      dataIndex: "simplifiedSubject", // Use simplified subject name in the table
      key: "simplifiedSubject",
      render: (text) => text || "N/A",
    },
    {
      title: "Assessment",
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
                  <span className="assessment-tag">{tagPrefix}</span>
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
        <Space size="small" wrap>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditAssignment(record._id)}>
            Edit
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAssignment(record._id)}>
            Delete
          </Button>
          <Button type="default" icon={<PrinterOutlined />} onClick={() => handlePrintAssignment(record)}>
            Print
          </Button>
          <Button
            type="default"
            icon={<FileImageOutlined />}
            onClick={() => handleShowEvidence(record)}
            disabled={!record.evidence || record.evidence.length === 0}
          >
            Evidence
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

  // Render the current evidence item based on its type
  const renderCurrentEvidence = () => {
    if (!currentEvidence || currentEvidence.length === 0) {
      return <Empty description="No evidence available" />
    }

    const currentItem = currentEvidence[currentSlideIndex]

    if (isImageUrl(currentItem)) {
      return <Image src={currentItem || "/placeholder.svg"} alt={`Evidence ${currentSlideIndex + 1}`} />
    } else if (isVideoUrl(currentItem)) {
      return (
        <video controls width="100%" style={{ maxHeight: "400px" }}>
          <source src={currentItem} />
          Your browser does not support the video tag.
        </video>
      )
    } else {
      return (
        <div>
          <Text>File: </Text>
          <a href={currentItem} target="_blank" rel="noopener noreferrer">
            {currentItem.split("/").pop() || "View File"}
          </a>
        </div>
      )
    }
  }

  return (
    <div className="student-page-container">
      <div className="student-header">
        <Button className="back-button" onClick={handleBack}>
          Back
        </Button>
        <h1>Student Assessments</h1>
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrintAllAssignments}
          className="print-all-button"
        >
          Print All
        </Button>
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
            <h2>Assessments</h2>
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
                ? "No assessments found for this student"
                : `No assessments found for subject: ${subjectFilter}`
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      {/* Evidence Modal with Slideshow */}
      <Modal
        title={`Evidence for ${currentAssignment?.assignmentName || "Assessment"}`}
        open={evidenceModalVisible}
        onCancel={() => setEvidenceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setEvidenceModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="80%"
      >
        {currentEvidence.length > 0 ? (
          <div className="slideshow-container">
            <div className="slideshow-header">
              <Title level={5}>
                Evidence {currentSlideIndex + 1} of {currentEvidence.length}
              </Title>
            </div>

            <div className="slideshow-content">{renderCurrentEvidence()}</div>

            <div className="slideshow-navigation">
              <Button
                className="nav-button prev"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                icon={<LeftOutlined />}
              >
                Previous
              </Button>
              <div className="slideshow-indicator">
                {currentEvidence.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentSlideIndex ? "active" : ""}`}
                    onClick={() => setCurrentSlideIndex(index)}
                  />
                ))}
              </div>
              <Button
                className="nav-button next"
                onClick={nextSlide}
                disabled={currentSlideIndex === currentEvidence.length - 1}
                icon={<RightOutlined />}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <Empty description="No evidence available" />
        )}
      </Modal>
    </div>
  )
}

export default StudentAssessmentPage
