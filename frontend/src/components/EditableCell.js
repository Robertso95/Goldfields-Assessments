import { useState, useEffect, useRef } from "react"
import { Input } from "antd"

const { TextArea } = Input

const EditableCell = ({ value, onChange, multiline = false }) => {
  const [editing, setEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value || "")
  const inputRef = useRef(null)

  useEffect(() => {
    setCurrentValue(value || "")
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const handleClick = () => {
    setEditing(true)
  }

  const handleChange = (e) => {
    setCurrentValue(e.target.value)
  }

  const handleBlur = () => {
    setEditing(false)
    if (currentValue !== value) {
      onChange(currentValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur()
    }
  }

  if (editing) {
    return multiline ? (
      <TextArea
        ref={inputRef}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        autoSize={{ minRows: 2, maxRows: 6 }}
        className="editable-cell-input"
      />
    ) : (
      <Input
        ref={inputRef}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="editable-cell-input"
      />
    )
  }

  return (
    <div className={`editable-cell ${!currentValue ? "empty-cell" : ""}`} onClick={handleClick}>
      {currentValue || "Click to edit..."}
    </div>
  )
}

export default EditableCell

