import React, { useState, useEffect } from "react";
import Logo from "../components/logo.js";
import "../class.css";
import axios from "../axios.js";
import { FaSearch } from "react-icons/fa";

function Class() {

    //Stating variables of user role, list of user, children and delete
    const [role, setRole] = useState("");
    const [list, setList] = useState([]);
    const [children, setChildren] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [deleteStatus, setDeleteStatus] = useState({
        status: "",
        msg: ""
    });

    const [selecetUser, setSelecetUser] = useState({});

    //Search user when enter key is pressed, invoking the function of getData
    const [name, setName] = useState("");


    const nameHandler = (e) => {
        if (e.key === 'Enter') {
            getData();
        }
    }

    // Fetch classes with teacher information
    const fetchClasses = async () => {
        try {
            const response = await axios.get('/classes/list');
            if (response.status === 200) {
                console.log("Classes fetched:", response.data);
                setClasses(response.data);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    // Fetch teachers (users with Teacher role)
    const fetchTeachers = async () => {
        try {
            // Get all users then filter for teachers
            const response = await axios.post('/users/userList', {});
            if (response.status === 200) {
                const teachersList = response.data.filter(user => user.role === 'Teacher');
                console.log("Teachers found:", teachersList.length);
                setTeachers(teachersList);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    // Assign teacher to class
    const assignTeacherToClass = async (classId, teacherId) => {
        try {
            console.log("Assigning teacher:", teacherId, "to class:", classId);
            
            const response = await axios.post('/classes/assign-teacher', { 
                classId, 
                teacherId 
            });
            
            console.log("Assignment response:", response);
            
            if (response.status === 200) {
                setDeleteStatus({ status: 200, msg: "Teacher assigned successfully!" });
                setTimeout(() => {
                    setDeleteStatus({ status: "", msg: "" });
                }, 2000);
                
                // Refresh class data
                await fetchClasses();
            } else {
                setDeleteStatus({ status: 400, msg: "Failed to assign teacher" });
            }
        } catch (error) {
            console.error("Error assigning teacher:", error.response?.data || error.message);
            setDeleteStatus({ status: 400, msg: "Error assigning teacher" });
        }
    };

    //Fetching stories from backend
    const fetchStories = async () => {
        const response = await axios.get('/classes/list')
        if (parseInt(response.status) === 200) {
            let list = [];
            for (let row of response.data) {
                list.push(...row?.students);
            }
            setChildren(list)
        }
    }

    //Userdata from backend
    async function getData() {
        try {
            const list = "/users/userList";
            // Make a POST request to login details
            const response = await axios.post(list, { name: name });
            for (let row of response?.data) {
                if (row?.email == selecetUser?.email) {
                    setSelecetUser(row);
                    break;
                }
            }
            setList(response?.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    //Function to delete account
    const deleteUser = async (id, name) => {
        //Confirmation upon delete button being clicked
        if (window.confirm(`Are you sure you want to delete ${name} ?`)) {
            try {
                const list = "/users/delete";
                // Make a POST request to login details
                const response = await axios.post(list, { id: id });
                if (parseInt(response?.status) === 200) {
                    setDeleteStatus({ status: 200, msg: "Deleted Successfully!" });

                    setTimeout(() => {
                        setDeleteStatus({ status: "", msg: "" });

                    }, 2000);
                    //Refresh user data after being deleted
                    await getData();
                    // Refresh teachers list in case we deleted a teacher
                    await fetchTeachers();
                }
                else {
                    setDeleteStatus({ status: 400, msg: "something went wrong!" });
                }

            } catch (error) {
                setDeleteStatus({ status: 400, msg: "something went wrong!" });
            }
        }
    }

    //Function to update user role
    const updateUser = async (id, role) => {
        try {
            const list = "/users/update";
            // Make a POST request to login endpoint of email and password
            const response = await axios.post(list, { id: id, role: role });
            console.log(response);
            if (parseInt(response?.status) === 200) {
                setDeleteStatus({ status: 200, msg: "Role updated Successfully!" });
                setTimeout(() => {
                    setDeleteStatus({ status: "", msg: "" });
                }, 2000);
                await getData();
                // Refresh teachers list if we just added or removed a teacher
                await fetchTeachers();
            }
            else {
                setDeleteStatus({ status: 400, msg: "An Unexpected error occured!" });
            }

        } catch (error) {
            setDeleteStatus({ status: 400, msg: "An Unexpected error occured!" });
        }
    }

    const updateChild = async (id, child) => {
        try {
            const list = "/users/update";
            // Make a POST request to login endpoint of email and password
            const response = await axios.post(list, { id: id, child: child });
            if (parseInt(response?.status) === 200) {
                setDeleteStatus({ status: 200, msg: "Story Updated Successfully!" });
                setTimeout(() => {
                    setDeleteStatus({ status: "", msg: "" });
                }, 2000);
                await getData();
            }
            else {
                setDeleteStatus({ status: 400, msg: "something went wrong!" });
            }

        } catch (error) {
            setDeleteStatus({ status: 400, msg: "something went wrong!" });
        }
    }

    const [selectedAdditionalTeacher, setSelectedAdditionalTeacher] = useState({});

// Function to add an additional teacher
const assignAdditionalTeacher = async (classId, teacherId) => {
  if (!teacherId) return;
  
  try {
    const response = await axios.post('/classes/assign-additional-teacher', {
      classId,
      teacherId,
      action: 'add'
    });
    
    if (response.status === 200) {
      setDeleteStatus({ status: 200, msg: "Additional teacher added successfully!" });
      setTimeout(() => {
        setDeleteStatus({ status: "", msg: "" });
      }, 2000);
      
      // Refresh class data
      await fetchClasses();
      
      // Reset the selection
      setSelectedAdditionalTeacher({
        ...selectedAdditionalTeacher,
        [classId]: ""
      });
    }
  } catch (error) {
    console.error("Error adding additional teacher:", error);
    setDeleteStatus({ status: 400, msg: "Error adding additional teacher" });
  }
};

// Function to remove an additional teacher
const removeAdditionalTeacher = async (classId, teacherId) => {
  try {
    const response = await axios.post('/classes/assign-additional-teacher', {
      classId,
      teacherId,
      action: 'remove'
    });
    
    if (response.status === 200) {
      setDeleteStatus({ status: 200, msg: "Teacher removed successfully!" });
      setTimeout(() => {
        setDeleteStatus({ status: "", msg: "" });
      }, 2000);
      
      // Refresh class data
      await fetchClasses();
    }
  } catch (error) {
    console.error("Error removing teacher:", error);
    setDeleteStatus({ status: 400, msg: "Error removing teacher" });
  }
};


    useEffect(() => {
        setRole(localStorage.getItem("role"));
        getData();
        fetchStories();
        fetchClasses();
        fetchTeachers();
    }, [])
    
    //Display all users, each user gets a small shape format which has name email current role and delete user
    return (
        <div className="class-page-container">
            <div className="classes-container" style={{ marginTop: "5rem" }}>
                <p style={{ color: parseInt(deleteStatus?.status) === 200 ? "green" : "red" }}>{deleteStatus?.msg}</p>
                <div>
                    {/* Creating the the search container with an icon, name handler gets called when pressed*/}
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", borderRadius: "5px", background: "#f0f0f0", width: "300px", height: "40px" }}>
                        <FaSearch style={{ marginLeft: "5px" }} className="nav-icon" />
                        <input onKeyPress={nameHandler} value={name} onChange={(e) => setName(e.target.value)} style={{ border: "none", outline: "none", background: "#f0f0f0" }} placeholder="Search by Full Name" type="text" />
                    </div>
                    {/*The table displaying with the details  */}
                    <table style={{ width: "100%", border: "solid 1px", borderCollapse: "collapse", borderRadius: "15px", padding: "30px", background: "white", marginTop: "10px" }}>
                        <thead >
                            <tr style={{ border: "solid", borderWidth: "1px 0" }}>

                                <th style={{ padding: "30px" }}>Full Name</th>
                                <th style={{ padding: "30px" }}>Email Address</th>
                                <th style={{ padding: "30px" }}>Role</th>
                                <th style={{ padding: "30px" }}>Change Role</th>
                                <th style={{ padding: "30px" }}>Assign to Child</th>
                                <th style={{ padding: "30px" }}>Delete User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? (
                                list.map((row, index) => {

                                    if (localStorage.getItem("email") !== row?.email) {
                                        return (
                                            //Table row for users
                                            <tr key={row?._id} style={{ border: "solid", borderWidth: "1px 0" }}>
                                                <td style={{ padding: "30px", textAlign: "center" }}>{row?.name}</td>
                                                <td style={{ padding: "30px", textAlign: "center" }}>{row?.email}</td>
                                                <td style={{ padding: "30px", textAlign: "center" }}>{row?.role}</td>
                                                <td style={{ padding: "30px", textAlign: "center" }}>
                                                    {
                                                        role !== "Teacher" && localStorage.getItem("email") !== row?.email &&
                                                        <>
                                                            <select value={row?.role} onChange={(e) => updateUser(row?._id, e.target.value)} style={{ padding: "10px", cursor: "pointer", marginTop: "0px" }}>
                                                                <option value=""> Select Role</option>
                                                                <option value="Parent"> Parent</option>
                                                                <option value="Family"> Family</option>
                                                                <option value="Admin"> Admin</option>
                                                                <option value="Teacher"> Teacher</option>
                                                            </select>
                                                        </>
                                                    }
                                                </td>
                                                <td style={{ padding: "30px", textAlign: "center", height: "20px" }}>
                                                    {
                                                        ["Parent", "Family"].includes(row?.role) && localStorage.getItem("email") !== row?.email && ["Admin", "Parent"].includes(localStorage.getItem("role")) &&
                                                        <>
                                                            <select value={row?.child} onChange={(e) => updateChild(row?._id, e.target.value)} style={{ padding: "10px", cursor: "pointer", marginTop: "0px" }}>
                                                                <option value=""> Select Child</option>
                                                                {
                                                                    children?.length >= 1 && children?.map((row, index) => (
                                                                        <option key={row?._id} value={row?.firstName + ' ' + row?.lastName}> {row?.firstName + ' ' + row?.lastName}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </>
                                                    }
                                                </td>
                                                <td style={{ padding: "30px", textAlign: "center", textAlign: "center" }}>
                                                    <svg onClick={() => deleteUser(row?._id, row?.name)} style={{ color: "red", cursor: "pointer", width: "30px", height: "30px" }} fill="black" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 482.428 482.429">
                                                        <g>
                                                            <g>
                                                                <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
                                                            c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
                                                            h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
                                                            C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
                                                            C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
                                                            c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
                                                            c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
                                                            V115.744z"/>
                                                                <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
                                                            c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"/>
                                                                <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
                                                            c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"/>
                                                                <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
                                                            c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/>
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </td>
                                            </tr>
                                        )
                                    }
                                })) : <tr>
                                <td colSpan="6" style={{ padding: "30px", textAlign: "center" }}>No Data Found</td>
                            </tr>
                            }
                        </tbody>
                    </table>
                </div>

                {/* Teacher-Class Assignment Section */}
                <div style={{ marginTop: "50px" }}>
                    <h3 style={{ fontSize: "24px" }}>Assign Teachers to Classes</h3>
                    
                    <table style={{ width: "100%", border: "solid 1px", borderCollapse: "collapse", borderRadius: "15px", padding: "30px", background: "white", marginTop: "10px" }}>
  <thead>
    <tr style={{ border: "solid", borderWidth: "1px 0" }}>
      <th style={{ padding: "20px" }}>Class Name</th>
      <th style={{ padding: "20px" }}>Main Teacher</th>
      <th style={{ padding: "20px" }}>Additional Teachers</th>
      <th style={{ padding: "20px" }}>Assign Teachers</th>
    </tr>
  </thead>
  <tbody>
    {classes.length > 0 ? (
      classes.map((classItem) => {
        // Find the current teacher for this class
        const mainTeacher = teachers.find(teacher => teacher._id === classItem.teacherId);
        
        return (
          <tr key={classItem._id} style={{ border: "solid", borderWidth: "1px 0" }}>
            <td style={{ padding: "20px", textAlign: "center" }}>{classItem.className}</td>
            <td style={{ padding: "20px", textAlign: "center" }}>
              {mainTeacher ? mainTeacher.name : "No teacher assigned"}
              <br />
              <select 
                value={classItem.teacherId || ""}
                onChange={(e) => assignTeacherToClass(classItem._id, e.target.value)}
                style={{ padding: "10px", cursor: "pointer", marginTop: "10px" }}
              >
                <option value="">Change Main Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ padding: "20px", textAlign: "center" }}>
              {/* Display all additional teachers with remove buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {classItem.additionalTeachers && classItem.additionalTeachers.length > 0 ? (
                  classItem.additionalTeachers.map(teacherId => {
                    const teacher = teachers.find(t => t._id === teacherId);
                    return teacher ? (
                      <div key={teacherId} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span>{teacher.name}</span>
                        <button 
                          onClick={() => removeAdditionalTeacher(classItem._id, teacherId)}
                          style={{ background: "red", color: "white", border: "none", borderRadius: "5px", padding: "5px 10px", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })
                ) : (
                  <span>No additional teachers</span>
                )}
              </div>
            </td>
            <td style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <select 
                  value={selectedAdditionalTeacher[classItem._id] || ""}
                  onChange={(e) => setSelectedAdditionalTeacher({
                    ...selectedAdditionalTeacher,
                    [classItem._id]: e.target.value
                  })}
                  style={{ padding: "10px", cursor: "pointer" }}
                >
                  <option value="">Select Additional Teacher</option>
                  {teachers
                    .filter(teacher => 
                      // Don't show main teacher or already assigned additional teachers
                      teacher._id !== classItem.teacherId && 
                      (!classItem.additionalTeachers || !classItem.additionalTeachers.includes(teacher._id))
                    )
                    .map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))
                  }
                </select>
                <button 
                  onClick={() => assignAdditionalTeacher(classItem._id, selectedAdditionalTeacher[classItem._id])}
                  disabled={!selectedAdditionalTeacher[classItem._id]}
                  style={{ 
                    background: !selectedAdditionalTeacher[classItem._id] ? "#cccccc" : "#326C6F", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "5px", 
                    padding: "10px", 
                    cursor: !selectedAdditionalTeacher[classItem._id] ? "not-allowed" : "pointer"
                  }}
                >
                  Add Teacher
                </button>
              </div>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>No Classes Found</td>
      </tr>
    )}
  </tbody>
</table>
                </div>
            </div>
        </div>
    );
}

export default Class;