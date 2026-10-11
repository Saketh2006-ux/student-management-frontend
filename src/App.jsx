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
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // =========================
  // FORM
  // =========================

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
    setFormError("");

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // FORM VALIDATION
  // =========================

  const validateStudentForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const course = formData.course.trim();
    const age = Number(formData.age);
    const marks = Number(formData.marks);

    if (!name) return "Please enter the student's name.";
    if (name.length < 2) return "Name must contain at least 2 characters.";
    if (!/^[\\p{L}][\\p{L} .'-]*$/u.test(name)) {
      return "Name may contain letters, spaces, apostrophes, periods, or hyphens.";
    }
    if (!email) return "Please enter an email address.";
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!course) return "Please select a course.";
    if (formData.age === "" || !Number.isFinite(age) || age < 1 || age > 100) {
      return "Age must be a number between 1 and 100.";
    }
    if (formData.marks === "" || !Number.isFinite(marks) || marks < 0 || marks > 100) {
      return "Marks must be a number between 0 and 100.";
    }
    return "";
  };

  // =========================
  // ADD STUDENT
  // =========================

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateStudentForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          course: formData.course,
          age: Number(formData.age),
          marks: Number(formData.marks),
        }),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || "Failed to add student.");
      }

      alert("Student added successfully!");
      setFormData({ name: "", email: "", course: "", age: "", marks: "" });
      setFormError("");
      setShowStudentForm(false);
      setEditingStudent(null);
      setActivePage("students");
      await loadStudents();
    } catch (err) {
      setFormError(err.message || "Failed to add student. Check the backend.");
    } finally {
      setIsSubmitting(false);
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
    if (isSubmitting) return;

    const validationError = validateStudentForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          course: formData.course,
          age: Number(formData.age),
          marks: Number(formData.marks),
        }),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || "Failed to update student.");
      }

      alert("Student updated successfully!");
      setFormError("");
      setShowStudentForm(false);
      setEditingStudent(null);
      setActivePage("students");
      await loadStudents();
    } catch (err) {
      setFormError(err.message || "Failed to update student.");
    } finally {
      setIsSubmitting(false);
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
    const search = searchTerm.trim().toLowerCase();

    return (
      String(student.name ?? "").toLowerCase().includes(search) ||
      String(student.email ?? "").toLowerCase().includes(search) ||
      String(student.course ?? "").toLowerCase().includes(search)
    );
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison;

    if (["id", "age", "marks"].includes(sortBy)) {
      comparison = Number(a[sortBy] ?? 0) - Number(b[sortBy] ?? 0);
    } else {
      comparison = String(a[sortBy] ?? "").localeCompare(
        String(b[sortBy] ?? ""),
        undefined,
        { sensitivity: "base" }
      );
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = sortedStudents.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const changeSort = (field) => {
    if (sortBy === field) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // =========================
  // EXPORT STUDENT RECORDS
  // =========================

  const getExportRows = () => sortedStudents.map((student) => ({
    ID: student.id,
    Name: student.name,
    Email: student.email,
    Course: student.course,
    Age: student.age,
    Marks: student.marks,
    Status: Number(student.marks) >= 50 ? "Passed" : "Failed",
  }));

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const rows = getExportRows();
    const headers = ["ID", "Name", "Email", "Course", "Age", "Marks", "Status"];
    const escapeCSV = (value) => {
      const text = String(value ?? "");
      // Prevent spreadsheet formula injection for text fields.
      const safeText = /^[=+@\\-\\t\\r]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => headers.map((header) => escapeCSV(row[header])).join(",")),
    ].join("\r\n");
    const blob = new Blob(["\\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    downloadBlob(blob, "student-records.csv");
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(getExportRows());
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 24 },
        { wch: 32 },
        { wch: 26 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, "student-records.xlsx");
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Excel export needs the xlsx package. Install it in the frontend folder using: npm install xlsx");
    }
  };

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

  const topPerformer =
    students.length > 0
      ? students.reduce((top, student) =>
          Number(student.marks) > Number(top.marks)
            ? student
            : top
        )
      : null;

  const coursesOffered = new Set(
    students.map((student) => student.course)
  ).size;

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
                    Top Performer
                  </h3>

                  <h2>
                    {topPerformer ? topPerformer.name : "N/A"}
                  </h2>

                  <p>
                    {topPerformer
                      ? `${topPerformer.marks} marks`
                      : "No records yet"}
                  </p>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon purple">
                  🎓
                </div>

                <div>

                  <h3>
                    Courses Offered
                  </h3>

                  <h2>
                    {coursesOffered}
                  </h2>

                </div>

              </div>

            </div>

            <StudentTable
              students={paginatedStudents}
              totalFiltered={sortedStudents.length}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={changeSort}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onExportCSV={exportToCSV}
              onExportExcel={exportToExcel}
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
              students={paginatedStudents}
              totalFiltered={sortedStudents.length}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={changeSort}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onExportCSV={exportToCSV}
              onExportExcel={exportToExcel}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
              students={paginatedStudents}
              totalFiltered={sortedStudents.length}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={changeSort}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onExportCSV={exportToCSV}
              onExportExcel={exportToExcel}
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
              formError={formError}
              isSubmitting={isSubmitting}
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
  totalFiltered = students.length,
  sortBy = "id",
  sortOrder = "asc",
  onSort = () => {},
  pageSize = 10,
  onPageSizeChange = () => {},
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  onExportCSV = () => {},
  onExportExcel = () => {},
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
            {totalFiltered} student
            {totalFiltered !== 1 ? "s" : ""} found
          </p>

        </div>

        <div className="table-header-actions">
          <button
            type="button"
            className="export-button"
            onClick={onExportCSV}
            disabled={students.length === 0}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="export-button"
            onClick={onExportExcel}
            disabled={students.length === 0}
          >
            Export Excel
          </button>
          <button
            type="button"
            className="add-button"
            onClick={onAdd}
          >
            + Add Student
          </button>
        </div>

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
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("id")}
                  >
                    ID {sortBy === "id" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("name")}
                  >
                    Student {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("email")}
                  >
                    Email {sortBy === "email" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("course")}
                  >
                    Course {sortBy === "course" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("age")}
                  >
                    Age {sortBy === "age" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => onSort("marks")}
                  >
                    Marks {sortBy === "marks" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                  </button>
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

        <div className="pagination-controls">
          <div className="page-size-control">
            <label htmlFor="student-page-size">Rows per page:</label>
            <select
              id="student-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="pagination-navigation">
            <span>Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

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
  formError = "",
  isSubmitting = false,
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
                maxLength={100}
                autoComplete="name"
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
                maxLength={254}
                autoComplete="email"
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

          {formError && (
            <div className="error-message" role="alert" aria-live="polite">
              {formError}
            </div>
          )}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingStudent
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