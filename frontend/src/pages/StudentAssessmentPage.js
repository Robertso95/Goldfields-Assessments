import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spin, Button, message } from "antd"
import axios from "axios"
import "../StudentAssessmentPage.css"

const StudentAssessmentPage = () => {
  const { classId, studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch student details
        const studentResponse = await axios.get(`/api/classes/${classId}/students/${studentId}`)
        setStudent(studentResponse.data)

        // Fetch class details
        const classResponse = await axios.get(`/api/classes/${classId}`)
        setClassInfo(classResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        message.error("Failed to load data")

        // Set mock data for development/testing
        setStudent({
          _id: studentId,
          firstName: "Grace",
          lastName: "Thompson",
          class: "Room 5",
          term: "Term 3",
          assessmentType: "Number & Algebra 2-3",
          tags: ["hardworking", "focused"],
        })

        setClassInfo({
          _id: classId,
          className: "Room 5",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Force scroll to top when component mounts
    window.scrollTo(0, 0)

    // Add a small delay and scroll again to ensure it works
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }, [classId, studentId])

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = () => {
    message.success("Assessment saved successfully")
  }

  const handleCellEdit = (e) => {
    // Make the cell editable on click
    e.currentTarget.contentEditable = true
    e.currentTarget.focus()
  }

  const handleCellBlur = (e) => {
    // Save the content when focus is lost
    e.currentTarget.contentEditable = false
    // Here you would typically save the data to your backend
    console.log("Cell updated:", e.currentTarget.textContent)
  }

  const handleCellKeyDown = (e) => {
    // Save on Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading student assessment..." />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="error-container">
        <h2>Student not found</h2>
        <Button type="primary" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="assessment-page-wrapper">
      <div className="top-spacer"></div>
      <div className="assessment-page-container" ref={containerRef}>
        <div className="assessment-header">
          <Button className="back-button" onClick={handleBack}>
            Back
          </Button>
          <h1>
            {student.firstName} {student.lastName} - IEP
          </h1>
          <div className="header-actions">
            <Button type="primary" className="action-btn">
              Print / PDF
            </Button>
            <Button className="action-btn">Archive</Button>
            <Button type="primary" danger className="action-btn">
              Delete
            </Button>
            <Button type="primary" className="action-btn save-btn">
              Save and exit
            </Button>
          </div>
        </div>

        <div className="student-info-section">
          <div className="student-avatar">
            {student.image ? (
              <img src={student.image || "/placeholder.svg"} alt={`${student.firstName} ${student.lastName}`} />
            ) : (
              <div className="avatar-placeholder">
                {student.firstName.charAt(0)}
                {student.lastName.charAt(0)}
              </div>
            )}
            <h2>
              {student.firstName} {student.lastName}
            </h2>
          </div>

          <div className="student-details">
            <div className="detail-item">
              <span className="label">Class:</span>
              <span className="detail-value">{classInfo?.className || student.class || "Not assigned"}</span>
            </div>
            <div className="detail-item">
              <span className="label">ORS Number:</span>
              <span
                className="editable-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </span>
            </div>
            <div className="detail-item">
              <span className="label">ORS Status:</span>
              <span
                className="editable-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </span>
            </div>
          </div>
        </div>

        <table className="assessment-table">
          <tbody>
            <tr>
              <th className="header-cell whanau-wishes">Whanau wishes for their tamaiti</th>
              <th className="header-cell class-team">Class team</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td className="content-cell team-cell">
                <div className="team-member">
                  <span className="label">Teacher:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
                <div className="team-member">
                  <span className="label">Teacher Aides:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
                <div className="team-member">
                  <span className="label">SLT:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
                <div className="team-member">
                  <span className="label">PT:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
                <div className="team-member">
                  <span className="label">OT:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <th className="header-cell celebrations">Celebrations and Strengths</th>
              <th className="header-cell student-voice">Student Voice</th>
              <th className="header-cell other-programmes">Other Programmes that support my learning and Hauora</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <th className="header-cell actions">Actions and Responsibilities</th>
              <th className="header-cell plans">Plans to be reviewed - Seizure/Eating plans</th>
              <th className="header-cell attendees">Attendees of the Brainstorming IEP meeting</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <th className="header-cell long-term-goal-1">Long Term Goals 1</th>
              <th className="header-cell long-term-goal-2">Long Term Goal 2</th>
              <th className="header-cell long-term-goal-3">Long Term Goal 3</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
            </tr>

            <tr>
              <th className="header-cell goal-1">Goal 1</th>
              <th className="header-cell goal-2">Goal 2</th>
              <th className="header-cell goal-3">Goal 3</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
            </tr>

            <tr>
              <th className="header-cell staff-1">Staff responsible for Goal development:</th>
              <th className="header-cell staff-2">Staff responsible for Goal development:</th>
              <th className="header-cell staff-3">Staff responsible for Goal development:</th>
            </tr>
            <tr>
              <td className="content-cell">
                <div className="staff-detail">
                  <span className="label">Name:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
              </td>
              <td className="content-cell">
                <div className="staff-detail">
                  <span className="label">Name:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
              </td>
              <td className="content-cell">
                <div className="staff-detail">
                  <span className="label">Name:</span>
                  <span
                    className="editable-cell"
                    onClick={handleCellEdit}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  >
                    Click to edit...
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
              <td className="empty-cell"></td>
            </tr>

            <tr>
              <th className="header-cell term-2-progress-1">Term 2 Progress</th>
              <th className="header-cell term-2-progress-2">Term 2 Progress</th>
              <th className="header-cell term-2-progress-3">Term 2 Progress</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <th className="header-cell term-3-progress-1">Term 3 Progress</th>
              <th className="header-cell term-3-progress-2">Term 3 Progress</th>
              <th className="header-cell term-3-progress-3">Term 3 Progress</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>

            <tr>
              <th className="header-cell term-4-summary-1">Term 4 End of Year Summary</th>
              <th className="header-cell term-4-summary-2">Term 4 End of Year Summary</th>
              <th className="header-cell term-4-summary-3">Term 4 End of Year Summary</th>
            </tr>
            <tr>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
              <td
                className="content-cell"
                onClick={handleCellEdit}
                onBlur={handleCellBlur}
                onKeyDown={handleCellKeyDown}
              >
                Click to edit...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentAssessmentPage

