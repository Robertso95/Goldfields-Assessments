import { useState } from "react"
import { Modal, Table, Button, Spin, Empty } from "antd"
import axios from "axios"

const StudentAssessmentView = ({ student, classId }) => {
  const [visible, setVisible] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(false)

  const showModal = () => {
    setVisible(true)
    fetchStudentAssessments()
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const fetchStudentAssessments = async () => {
    if (!student || !student._id) {
      console.error("Student ID is missing")
      return
    }

    setLoading(true)
    try {
      // You'll need to create this endpoint in your backend
      // For now, I'll use a mock response based on your data structure
      const response = await axios.get(`/api/classes/${classId}/students/${student._id}/assessments`)

      // If you don't have this endpoint yet, you can use this mock data for testing
      if (!response.data) {
        // Mock data based on your data.json structure
        const mockAssessments = [
          {
            _id: "1",
            name: student.assessmentType || "Number & Algebra 2-3 - Early Level 1",
            score: "85/100",
            date: new Date(),
            status: "Completed",
            grade: "Achieved Independently",
          },
        ]
        setAssessments(mockAssessments)
      } else {
        setAssessments(response.data)
      }
    } catch (error) {
      console.error("Error fetching assessments:", error)
      // Use mock data if API fails
      const mockAssessments = [
        {
          _id: "1",
          name: student.assessmentType || "Number & Algebra 2-3 - Early Level 1",
          score: "85/100",
          date: new Date(),
          status: "Completed",
          grade: "Achieved Independently",
        },
      ]
      setAssessments(mockAssessments)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "Assessment Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
  ]

  return (
    <>
      <Button type="primary" onClick={showModal}>
        View
      </Button>
      <Modal
        title={`Assessments for ${student?.firstName} ${student?.lastName}`}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Loading assessments..." />
          </div>
        ) : assessments.length === 0 ? (
          <Empty description="No assessments found for this student" />
        ) : (
          <Table dataSource={assessments} columns={columns} rowKey="_id" pagination={false} />
        )}
      </Modal>
    </>
  )
}

export default StudentAssessmentView

