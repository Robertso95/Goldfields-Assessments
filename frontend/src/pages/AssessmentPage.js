import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { Table, Select, Typography, Spin } from "antd"
import axios from "axios"
import StudentAssessmentView from "../components/StudentAssessmentView"

const { Option } = Select
const { Title } = Typography

const AssessmentPage = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch classes when component mounts
    fetchClasses()
  }, [])

  useEffect(() => {
    // Fetch students when selected class changes
    if (selectedClass) {
      fetchStudents(selectedClass)
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/classes")
      setClasses(response.data)
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id || response.data[0]._id)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching classes:", error)
      setLoading(false)
    }
  }

  const fetchStudents = async (classId) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/classes/${classId}`)
      setStudents(response.data.students || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching students:", error)
      setLoading(false)
    }
  }

  const handleClassChange = (value) => {
    setSelectedClass(value)
  }

  const columns = [
    {
      title: "Full Name",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
      render: () => {
        const classObj = classes.find((c) => c.id === selectedClass || c._id === selectedClass)
        return classObj ? classObj.className : ""
      },
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
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (
        <>
          {tags &&
            tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#f0f9eb",
                  color: "#67c23a",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  marginRight: "5px",
                }}
              >
                {tag.toUpperCase()}
              </span>
            ))}
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="primary">Edit</Button>
          <StudentAssessmentView student={record} classId={selectedClass} />
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Select Class</Title>
      <Select
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Select a class"
        onChange={handleClassChange}
        value={selectedClass}
      >
        {classes.map((classItem) => (
          <Option key={classItem.id || classItem._id} value={classItem.id || classItem._id}>
            {classItem.className}
          </Option>
        ))}
      </Select>

      <Title level={2}>Students</Title>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table dataSource={students} columns={columns} rowKey="_id" />
      )}
    </div>
  )
}

export default AssessmentPage

