import { useState, useEffect, useRef } from "react"
import { Button, DatePicker, Form, Select, Modal, message, Spin } from "antd"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import axios from "axios"
import "../createAssignment.css"
import CheckboxTagList from "../components/CheckboxTagList/CheckboxTagList"
import { useNavigate, useLocation } from "react-router-dom"

const { Option } = Select

const CreateAssignment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [selectedStudents, setSelectedStudents] = useState([])
  const [description, setDescription] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [learningSets, setLearningSets] = useState([])
  const [assignmentTypes, setAssignmentTypes] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredtags] = useState([])
  /**
   * @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]}
   */
  const [images, setImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const cloudinaryWidgetRef = useRef()
  const [classes, setClasses] = useState([])
  const [classStudents, setClassStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = useState(null)
  const [originalAssignment, setOriginalAssignment] = useState(null)
  // Add these state variables to store original subject and assignment
  const [originalSubject, setOriginalSubject] = useState(null)
  const [originalAssignmentType, setOriginalAssignmentType] = useState(null)
  // Add state for completed date
  const [completedDate, setCompletedDate] = useState(null)

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search)
  const editAssignmentId = queryParams.get("edit")
  const preSelectedStudentId = queryParams.get("studentId")
  const preSelectedClassId = queryParams.get("classId")

  useEffect(() => {
    cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "drpnvb7qc",
        uploadPreset: "tetlineq",
        sources: ["local"],
        clientAllowedFormats: ["image", "video"],
        multiple: true,
      },
      // The function the widget runs after you upload an image
      async (error, result) => {
        if (!error && result && result.event === "success") {
          setImages([...images, result.info.secure_url])
          setCurrentIndex((prevIndex) => prevIndex + 1)
        }
      },
    )
  }, [images])

  // Check if we're editing an existing assignment
  useEffect(() => {
    if (editAssignmentId) {
      setIsEditing(true)
      setEditingAssignmentId(editAssignmentId)
      fetchAssignmentDetails(editAssignmentId)
    }
  }, [editAssignmentId])

  const fetchAssignmentDetails = async (assignmentId) => {
    setLoading(true)
    try {
      // Get all assignments
      const response = await axios.get("/api/assignments")

      if (response.status === 200) {
        // Find the specific assignment by ID
        const assignmentData = response.data.find((assignment) => assignment._id === assignmentId)

        if (assignmentData) {
          // Store the original assignment data for reference
          setOriginalAssignment(assignmentData)
          console.log("Original assignment data:", assignmentData)

          // Store original subject and assignment for submission
          setOriginalSubject(assignmentData.subject)
          setOriginalAssignmentType(assignmentData.assignment)

          // Handle the completed date
          if (assignmentData.completedDate) {
            // Store the date string directly
            setCompletedDate(assignmentData.completedDate)
          }

          // Set form values - but don't set subject and assignment
          form.setFieldsValue({
            className: assignmentData.className,
            studentNames: Array.isArray(assignmentData.studentNames)
              ? assignmentData.studentNames
              : [assignmentData.studentNames],
            // Don't set subject and assignment here
            additionalComments: assignmentData.additionalComments,
            // Don't set completedDate in the form
          })

          // Set state values
          setSelectedStudents(
            Array.isArray(assignmentData.studentNames) ? assignmentData.studentNames : [assignmentData.studentNames],
          )
          setDescription(assignmentData.description || "")
          setSelectedTags(assignmentData.tags || [])
          setImages(assignmentData.evidence || [])

          // Fetch class students
          if (assignmentData.className) {
            await handleClassChange(assignmentData.className)
          }

          // We'll still load the filtered assignments and tags
          // but we won't set the form values
          if (assignmentData.subject) {
            await handleChangeLearningSet(assignmentData.subject)
          }

          // Set filtered tags
          if (assignmentData.assignment) {
            await handleChangeAssignmentType(assignmentData.assignment)
          }
        } else {
          message.error("Assignment not found")
        }
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error)
      // Don't show error message to user, just log it
      // Instead, initialize with empty form for editing

      // If we have student and class IDs, we can still set those
      if (preSelectedClassId) {
        form.setFieldsValue({ className: preSelectedClassId })
        await handleClassChange(preSelectedClassId)

        if (preSelectedStudentId) {
          setSelectedStudents([preSelectedStudentId])
          form.setFieldsValue({ studentNames: [preSelectedStudentId] })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Check for pre-selected student and class from sessionStorage or URL params
  useEffect(() => {
    const storedStudentId = sessionStorage.getItem("selectedStudentId") || preSelectedStudentId
    const storedClassId = sessionStorage.getItem("selectedClassId") || preSelectedClassId

    if (storedClassId && !isEditing) {
      // Set the class in the form
      form.setFieldsValue({ className: storedClassId })

      // Fetch students for this class
      handleClassChange(storedClassId)

      // If we also have a pre-selected student, set it
      if (storedStudentId) {
        setSelectedStudents([storedStudentId])
        form.setFieldsValue({ studentNames: [storedStudentId] })
      }
    }
  }, [form, preSelectedStudentId, preSelectedClassId, isEditing])

  const handleImageUpload = () => {
    cloudinaryWidgetRef.current.open()
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/api/classes") // Adjust API endpoint
        if (response.status === 200) {
          setClasses(response.data) // Assuming response.data is an array of classes
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
      }
    }

    fetchClasses()
  }, [])

  const handleClassChange = async (classId) => {
    try {
      const response = await axios.get(`/api/classes/${classId}`)
      if (response.status === 200 && response.data.students) {
        setClassStudents(response.data.students)
      }
    } catch (error) {
      console.error("Error fetching class students:", error)
    }
  }

  // Fetch assignment titles from MongoDB
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [learningSetsRes, assignmentTypesRes, tagsRes] = await Promise.all([
          axios.get("/api/learningsets"),
          axios.get("/api/assignmenttype"),
          axios.get("/api/tags"),
        ])

        if (learningSetsRes.status === 200) {
          setLearningSets(learningSetsRes.data)
        }

        if (assignmentTypesRes.status === 200) {
          setAssignmentTypes(assignmentTypesRes.data)
        }

        if (tagsRes.status === 200) {
          setTags(tagsRes.data)
        }
      } catch (error) {
        console.error("Error fetching reference data:", error)
      }
    }

    fetchReferenceData()
  }, [])

  // Handle date change
  const handleDateChange = (date, dateString) => {
    setCompletedDate(dateString)
  }

  // Update the handleSubmit function to use original values when editing
  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // Create the assignment data object
      const assignmentData = {
        ...values,
        studentNames: selectedStudents,
        description,
        tags: selectedTags,
        evidence: images,
        completedDate: completedDate, // Use the state variable
      }

      // If we're editing, make sure to include the original subject and assignment
      if (isEditing && editingAssignmentId) {
        // Use the original values for subject and assignment if they're not provided in the form
        if (!values.subject && originalSubject) {
          assignmentData.subject = originalSubject
        }
        if (!values.assignment && originalAssignmentType) {
          assignmentData.assignment = originalAssignmentType
        }
      }

      console.log("Submitting assignment data:", assignmentData)

      if (isEditing && editingAssignmentId) {
        console.log("Updating assignment with ID:", editingAssignmentId)

        // Use the update endpoint
        const response = await axios.put(`/api/assignments/${editingAssignmentId}`, assignmentData)
        console.log("Update response:", response)

        if (response.status === 200) {
          message.success("Assignment updated successfully!")
        } else {
          throw new Error(`Unexpected response status: ${response.status}`)
        }
      } else {
        // Creating a new assignment
        const response = await axios.post("/api/assignments", assignmentData)
        console.log("Create response:", response)

        if (response.status === 201) {
          message.success("Assignment created successfully!")
        } else {
          throw new Error(`Unexpected response status: ${response.status}`)
        }
      }

      // Check if we came from a student's page
      if (preSelectedStudentId && preSelectedClassId) {
        // Navigate back to the student's assessment page
        navigate(`/class/${preSelectedClassId}/student-assessment/${preSelectedStudentId}`)
      } else {
        // Navigate to the assignments list
        navigate("/view-assignments")
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} assignment:`, error)

      // Show more detailed error message
      const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message
      message.error(`Failed to ${isEditing ? "update" : "create"} assignment: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentChange = (value) => {
    setSelectedStudents(value)
  }

  const handleDescriptionChange = (value) => {
    setDescription(value)
    form.setFieldsValue({ description: value })
  }

  const handleChangeLearningSet = (value) => {
    setFilteredAssignments(
      assignmentTypes.filter((assignment) => {
        return assignment.parent === value
      }),
    )
  }

  const handleChangeAssignmentType = (value) => {
    setFilteredtags(
      tags.filter((tag) => {
        return tag.parent === value && tag.isactive
      }),
    )
  }

  const handleCancel = () => {
    // Check if we came from a student's page
    if (preSelectedStudentId && preSelectedClassId) {
      // Navigate back to the student's assessment page
      navigate(`/class/${preSelectedClassId}/student-assessment/${preSelectedStudentId}`)
    } else {
      // Navigate to the assignments list
      navigate("/view-assignments")
    }
  }

  return (
    <div className="create-assignment-container">
      <h1>{isEditing ? "Edit Assignment" : "Create Assignment"}</h1>
      <div className="form-container">
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} className="create-assignment-form">
            <Form.Item
              label="Class Name"
              name="className"
              rules={[{ required: true, message: "Please select a class name!" }]}
            >
              <Select placeholder="Select class name" onChange={handleClassChange} disabled={isEditing}>
                {classes.map((cls) => (
                  <Option key={cls._id} value={cls._id}>
                    {cls.className}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Student Name"
              name="studentNames"
              rules={[{ required: true, message: "Please select a student!" }]}
            >
              <Select
                placeholder="Select student"
                value={selectedStudents}
                onChange={setSelectedStudents}
                disabled={isEditing}
              >
                {classStudents.map((student) => (
                  <Option key={student._id} value={student._id}>
                    {`${student.firstName} ${student.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Subject"
              name="subject"
              rules={[{ required: !isEditing, message: "Please select the title!" }]}
            >
              <Select
                placeholder="Select a subject"
                onChange={(value) => {
                  handleChangeLearningSet(value)
                }}
              >
                {learningSets.map((subject) => (
                  <Option key={subject._id} value={subject._id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Assignment"
              name="assignment"
              rules={[{ required: !isEditing, message: "Please select an assignemnt" }]}
            >
              <Select
                placeholder="Select an assignment"
                onChange={(value) => {
                  handleChangeAssignmentType(value)
                }}
              >
                {filteredAssignments.map((assignment) => (
                  <Option key={assignment._id} value={assignment._id}>
                    {assignment.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tags">
              <CheckboxTagList tags={filteredTags} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            </Form.Item>

            <Form.Item label="Additional Comments" name="additionalComments">
              <input type="text" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handleImageUpload}>
                Upload Evidence
              </Button>
              {images.length > 0 && (
                <div className="evidence-preview">
                  <p>{images.length} file(s) uploaded</p>
                </div>
              )}
            </Form.Item>

            <Form.Item label="Completed Date">
              <DatePicker onChange={handleDateChange} />
            </Form.Item>

            <Form.Item>
              <Button type="default" onClick={handleCancel} style={{ marginRight: 10 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? "Update" : "Submit"}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </div>

      {/* Description Modal */}
      <Modal
        title="Edit Description"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "70vh", overflowY: "auto" }}
      >
        <ReactQuill value={description} onChange={handleDescriptionChange} className="description-editor-modal" />
      </Modal>
    </div>
  )
}

export default CreateAssignment
