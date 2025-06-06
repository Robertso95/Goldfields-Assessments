import { useNavigate } from "react-router-dom"
import { Button } from "antd"

const StudentAssessmentView = ({ student, classId, className = "blue-button" }) => {
  const navigate = useNavigate()

  const handleViewAssessment = () => {
    if (!student || !student._id) {
      console.error("Student ID is missing")
      return
    }

    // Navigate to the assessment page with the actual student data
    navigate(`/class/${classId}/student-assessment/${student._id}`)

    // Force scroll to top (this will run after navigation)
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }

  return (
    <Button className={className} onClick={handleViewAssessment}>
      View
    </Button>
  )
}

export default StudentAssessmentView
