import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://student-management-backend-1v2c.onrender.com/api/students";

function App() {
  // =========================
  // LOGIN
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("studentMSRemember") === "true"
  );

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("studentMSLoggedIn") === "true" ||
      sessionStorage.getItem("studentMSLoggedIn") === "true"
  );

  // =========================
  // STUDENTS
  // =========================

  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  // =========================
  // NAVIGATION
  // =========================

  const [activePage, setActivePage] = useState("dashboard");

  // =========================
  // SEARCH
  // =========================

  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // FORM
  // =========================

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    age: "",
    marks: "",
  });

  // =========================
  // LOAD STUDENTS
  // =========================

  const loadStudents = () => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load students");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setError("");
      })
      .catch(() => {
        setError(
          "Unable to connect to the backend. Make sure Spring Boot is running."
        );
      });
  };

  useEffect(() => {
    if (loggedIn) {
      loadStudents();
    }
  }, [loggedIn]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      setLoggedIn(true);

      if (rememberMe) {
        localStorage.setItem("studentMSLoggedIn", "true");
        localStorage.setItem("studentMSRemember", "true");
      } else {
        sessionStorage.setItem("studentMSLoggedIn", "true");
      }
    } else {
      alert("Invalid username or password");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setLoggedIn(false);

    localStorage.removeItem("studentMSLoggedIn");
    localStorage.removeItem("studentMSRemember");
    sessionStorage.removeItem("studentMSLoggedIn");

    setUsername("");
    setPassword("");
    setStudents([]);
    setActivePage("dashboard");
  };

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = (e) => {
    e.preventDefault();

    alert(
      "Please contact the system administrator to reset your password."
    );
  };

  // =========================
  // NAVIGATION
  // =========================

  const goToDashboard = () => {
    setActivePage("dashboard");
    setShowStudentForm(false);
    setEditingStudent(null);
    setSearchTerm("");
  };

  const goToStudents = () => {
    setActivePage("students");
    setShowStudentForm(false);
    setEditingStudent(null);
    setSearchTerm("");
  };

  const goToAddStudent = () => {
    setActivePage("add");
    setEditingStudent(null);

    setFormData({
      name: "",
      email: "",
      course: "",
      age: "",
      marks: "",
    });

    setShowStudentForm(true);
  };

  const goToSearch = () => {
    setActivePage("search");
    setShowStudentForm(false);
    setEditingStudent(null);
    setSearchTerm("");
  };

  // =========================
  // FORM INPUT
  // =========================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD STUDENT
  // =========================

  const handleAddStudent = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          course: formData.course,
          age: Number(formData.age),
          marks: Number(formData.marks),
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      alert("Student added successfully!");

      setFormData({
        name: "",
        email: "",
        course: "",
        age: "",
        marks: "",
      });

      setShowStudentForm(false);
      setEditingStudent(null);
      setActivePage("students");

      loadStudents();
    } catch {
      alert("Failed to add student. Check the backend.");
    }
  };

  // =========================
  // EDIT STUDENT
  // =========================

  const handleEditClick = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age,
      marks: student.marks,
    });

    setActivePage("edit");
    setShowStudentForm(true);
  };

  // =========================
  // UPDATE STUDENT
  // =========================

  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/${editingStudent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            course: formData.course,
            age: Number(formData.age),
            marks: Number(formData.marks),
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      alert("Student updated successfully!");

      setShowStudentForm(false);
      setEditingStudent(null);
      setActivePage("students");

      loadStudents();
    } catch {
      alert("Failed to update student.");
    }
  };

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDeleteStudent = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      alert("Student deleted successfully!");

      loadStudents();
    } catch {
      alert("Failed to delete student.");
    }
  };

  // =========================
  // CANCEL FORM
  // =========================

  const handleCancelForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
    setActivePage("students");

    setFormData({
      name: "",
      email: "",
      course: "",
      age: "",
      marks: "",
    });
  };

  // =========================
  // SEARCH
  // =========================

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    return (
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.course.toLowerCase().includes(search)
    );
  });

  // =========================
  // DASHBOARD CALCULATIONS
  // =========================

  const totalStudents = students.length;

  const averageMarks =
    totalStudents > 0
      ? (
          students.reduce(
            (total, student) => total + Number(student.marks),
            0
          ) / totalStudents
        ).toFixed(2)
      : "0.00";

  const highestMarks =
    totalStudents > 0
      ? Math.max(
          ...students.map((student) => Number(student.marks))
        )
      : 0;

  const dataScienceStudents = students.filter(
    (student) => student.course === "Data Science"
  ).length;

  // =========================
  // LOGIN PAGE
  // =========================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-container">

          <div className="login-left">

            <div className="brand">

              <div className="brand-logo">
                S
              </div>

              <span>
                Student Management System
              </span>

            </div>

            <div className="welcome-content">

              <h1>
                Manage Students.
                <br />
                Manage Success.
              </h1>

              <p>
                A centralized platform to manage student records,
                academic performance, and student information.
              </p>

            </div>

            <div className="login-footer">

              <span>
                © 2026 Student Management System
              </span>

              <span>
                Secure • Reliable • Simple
              </span>

            </div>

          </div>

          <div className="login-right">

            <div className="login-form-container">

              <div className="mobile-logo">
                <div className="brand-logo">
                  S
                </div>
              </div>

              <h2>
                Welcome back
              </h2>

              <p className="login-description">
                Sign in to access your administrator dashboard
              </p>

              <form onSubmit={handleLogin}>

                <div className="input-group">

                  <label>
                    Username
                  </label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      👤
                    </span>

                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      required
                    />

                  </div>

                </div>

                <div className="input-group">

                  <label>
                    Password
                  </label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      🔒
                    </span>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                    />

                  </div>

                </div>

                <div className="login-options">

                  <label className="remember-me">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <a
                    href="#"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </a>

                </div>

                <button
                  type="submit"
                  className="login-button"
                >
                  <span>
                    Sign In
                  </span>

                  <span>
                    →
                  </span>
                </button>

              </form>

              <div className="security-note">
                🔐 Your connection is protected and secure
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div>

          <div className="sidebar-brand">

            <div className="sidebar-logo">
              S
            </div>

            <div className="sidebar-brand-text">

              <strong>
                Student MS
              </strong>

              <span>
                Management System
              </span>

            </div>

          </div>

          <div className="sidebar-divider"></div>

          <p className="menu-title">
            MAIN MENU
          </p>

          <nav>

            <div
              className={`nav-item ${
                activePage === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={goToDashboard}
            >
              <span className="nav-icon">
                ▦
              </span>

              <span>
                Dashboard
              </span>
            </div>

            <div
              className={`nav-item ${
                activePage === "students"
                  ? "active"
                  : ""
              }`}
              onClick={goToStudents}
            >
              <span className="nav-icon">
                ♙
              </span>

              <span>
                Students
              </span>
            </div>

            <div
              className={`nav-item ${
                activePage === "add"
                  ? "active"
                  : ""
              }`}
              onClick={goToAddStudent}
            >
              <span className="nav-icon">
                ＋
              </span>

              <span>
                Add Student
              </span>
            </div>

            <div
              className={`nav-item ${
                activePage === "search"
                  ? "active"
                  : ""
              }`}
              onClick={goToSearch}
            >
              <span className="nav-icon">
                ⌕
              </span>

              <span>
                Search
              </span>
            </div>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="user-info">

            <div className="user-avatar">
              A
            </div>

            <div>

              <strong>
                Administrator
              </strong>

              <span>
                Admin
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* DASHBOARD */}

        {activePage === "dashboard" && (
          <>
            <div className="dashboard-header">

              <div>

                <h1>
                  Student Management Dashboard
                </h1>

                <p>
                  Welcome back, Admin!
                </p>

              </div>

              <div className="admin-profile">

                <div className="admin-avatar">
                  A
                </div>

                <div>

                  <strong>
                    Administrator
                  </strong>

                  <small>
                    Admin
                  </small>

                </div>

              </div>

            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="stats-container">

              <div className="stat-card">

                <div className="stat-icon blue">
                  👨‍🎓
                </div>

                <div>

                  <h3>
                    Total Students
                  </h3>

                  <h2>
                    {totalStudents}
                  </h2>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  📈
                </div>

                <div>

                  <h3>
                    Average Marks
                  </h3>

                  <h2>
                    {averageMarks}
                  </h2>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  🏆
                </div>

                <div>

                  <h3>
                    Highest Marks
                  </h3>

                  <h2>
                    {highestMarks}
                  </h2>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon purple">
                  🎓
                </div>

                <div>

                  <h3>
                    Data Science Students
                  </h3>

                  <h2>
                    {dataScienceStudents}
                  </h2>

                </div>

              </div>

            </div>

            <StudentTable
              students={students}
              onEdit={handleEditClick}
              onDelete={handleDeleteStudent}
              onAdd={goToAddStudent}
            />
          </>
        )}

        {/* STUDENTS */}

        {activePage === "students" && (
          <>
            <PageHeader
              title="Students"
              subtitle="View and manage all registered students"
            />

            <StudentTable
              students={students}
              onEdit={handleEditClick}
              onDelete={handleDeleteStudent}
              onAdd={goToAddStudent}
            />
          </>
        )}

        {/* SEARCH */}

        {activePage === "search" && (
          <>
            <PageHeader
              title="Search Students"
              subtitle="Search by name, email or course"
            />

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                autoFocus
              />

              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <StudentTable
              students={filteredStudents}
              onEdit={handleEditClick}
              onDelete={handleDeleteStudent}
              onAdd={goToAddStudent}
            />
          </>
        )}

        {/* ADD / EDIT */}

        {(activePage === "add" ||
          activePage === "edit") &&
          showStudentForm && (

            <StudentForm
              editingStudent={editingStudent}
              formData={formData}
              onChange={handleInputChange}
              onSubmit={
                editingStudent
                  ? handleUpdateStudent
                  : handleAddStudent
              }
              onCancel={handleCancelForm}
            />

          )}

      </main>

    </div>
  );
}


// ======================================================
// PAGE HEADER
// ======================================================

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">

      <div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>

    </div>
  );
}


// ======================================================
// STUDENT TABLE
// ======================================================

function StudentTable({
  students,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <div className="student-section">

      <div className="section-header">

        <div>

          <h2>
            Student Records
          </h2>

          <p>
            {students.length} student
            {students.length !== 1 ? "s" : ""} found
          </p>

        </div>

        <button
          className="add-button"
          onClick={onAdd}
        >
          + Add Student
        </button>

      </div>

      {students.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            ♙
          </div>

          <h3>
            No students found
          </h3>

          <p>
            Add a student to get started.
          </p>

          <button
            className="add-button"
            onClick={onAdd}
          >
            + Add Student
          </button>

        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Student
                </th>

                <th>
                  Email
                </th>

                <th>
                  Course
                </th>

                <th>
                  Age
                </th>

                <th>
                  Marks
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {students.map((student) => (

                <tr key={student.id}>

                  <td>
                    #{student.id}
                  </td>

                  <td>

                    <div className="student-name">

                      <div className="student-avatar">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {student.name}
                      </strong>

                    </div>

                  </td>

                  <td>
                    {student.email}
                  </td>

                  <td>

                    <span className="course-badge">
                      {student.course}
                    </span>

                  </td>

                  <td>
                    {student.age}
                  </td>

                  <td>

                    <strong>
                      {student.marks}
                    </strong>

                  </td>

                  <td>

                    <span
                      className={
                        Number(student.marks) >= 50
                          ? "status-badge passed"
                          : "status-badge failed"
                      }
                    >
                      {Number(student.marks) >= 50
                        ? "Passed"
                        : "Failed"}
                    </span>

                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="edit-button"
                        onClick={() =>
                          onEdit(student)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          onDelete(student.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}


// ======================================================
// STUDENT FORM
// ======================================================

function StudentForm({
  editingStudent,
  formData,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="form-page">

      <div className="page-header">

        <div>

          <h1>
            {editingStudent
              ? "Edit Student"
              : "Add Student"}
          </h1>

          <p>
            {editingStudent
              ? "Update student information"
              : "Enter student information below"}
          </p>

        </div>

      </div>

      <div className="student-form-card">

        <form onSubmit={onSubmit}>

          <div className="form-grid">

            <div className="form-field">

              <label>
                Student Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={onChange}
                required
              />

            </div>

            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={onChange}
                required
              />

            </div>

            <div className="form-field">

              <label>
                Course
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={onChange}
                required
              >

                <option value="">
                  Select course
                </option>

                <option value="Data Science">
                  Data Science
                </option>

                <option value="Computer Science">
                  Computer Science
                </option>

                <option value="Information Technology">
                  Information Technology
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Mechanical">
                  Mechanical
                </option>

                <option value="Civil">
                  Civil
                </option>

              </select>

            </div>

            <div className="form-field">

              <label>
                Age
              </label>

              <input
                type="number"
                name="age"
                placeholder="Enter age"
                min="1"
                max="100"
                value={formData.age}
                onChange={onChange}
                required
              />

            </div>

            <div className="form-field">

              <label>
                Marks
              </label>

              <input
                type="number"
                name="marks"
                placeholder="Enter marks"
                min="0"
                max="100"
                step="0.01"
                value={formData.marks}
                onChange={onChange}
                required
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
            >
              {editingStudent
                ? "Update Student"
                : "Save Student"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default App;