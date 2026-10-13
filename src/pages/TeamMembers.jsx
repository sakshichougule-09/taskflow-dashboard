import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Mail,
  Briefcase,
} from "lucide-react";

const STORAGE_KEY = "taskflow-employees";

const initialEmployees = [
  {
    id: 1,
    name: "Sakshi Chougule",
    email: "sakshi@example.com",
    role: "Project Manager",
    department: "Management",
  },
  {
    id: 2,
    name: "Rahul Patil",
    email: "rahul@example.com",
    role: "Frontend Developer",
    department: "Development",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "UI/UX Designer",
    department: "Design",
  },
  {
    id: 4,
    name: "Amit Kulkarni",
    email: "amit@example.com",
    role: "Backend Developer",
    department: "Development",
  },
];

function loadEmployees() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Unable to load employees:", error);
  }

  return initialEmployees;
}

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
};

export default function TeamMembers() {
  const [employees, setEmployees] = useState(loadEmployees);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error("Unable to save employees:", error);
    }
  }, [employees]);

  const filteredEmployees = employees.filter((employee) =>
    [employee.name, employee.email, employee.role, employee.department]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    });
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const employeeData = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      department: form.department.trim(),
    };

    if (editingId !== null) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingId
            ? { ...employee, ...employeeData }
            : employee,
        ),
      );
    } else {
      setEmployees((current) => [
        ...current,
        { ...employeeData, id: Date.now() },
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function deleteEmployee(id) {
    const employee = employees.find((item) => item.id === id);

    if (
      employee &&
      window.confirm(`Are you sure you want to remove ${employee.name}?`)
    ) {
      setEmployees((current) => current.filter((item) => item.id !== id));
    }
  }

  function getInitials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  return (
    <div className="team-page">
      <div className="team-page-header">
        <div>
          <h1>Team Members</h1>
          <p>Manage your team, roles, and departments.</p>
        </div>

        <button type="button" className="primary-button" onClick={openAddForm}>
          <Plus size={18} />
          Add member
        </button>
      </div>

      <div className="team-summary">
        <div className="team-summary-icon">
          <Users size={23} />
        </div>
        <div>
          <span>Total team members</span>
          <strong>{employees.length}</strong>
        </div>
      </div>

      <div className="team-toolbar">
        <div className="team-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search name, email, role, or department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search team members"
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="team-empty">
          <Users size={38} />
          <h3>No team members found</h3>
          <p>Try another search or add a new team member.</p>
        </div>
      ) : (
        <div className="team-grid">
          {filteredEmployees.map((employee) => (
            <article className="team-card" key={employee.id}>
              <div className="team-card-top">
                <div className="team-avatar">{getInitials(employee.name)}</div>

                <div className="team-card-actions">
                  <button
                    type="button"
                    className="team-icon-button"
                    title="Edit member"
                    aria-label={`Edit ${employee.name}`}
                    onClick={() => openEditForm(employee)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="team-icon-button danger"
                    title="Remove member"
                    aria-label={`Remove ${employee.name}`}
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{employee.name}</h3>
              <span className="team-role">{employee.role}</span>

              <div className="team-detail">
                <Mail size={16} />
                <span>{employee.email}</span>
              </div>

              <div className="team-detail">
                <Briefcase size={16} />
                <span>{employee.department}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="team-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
          >
            <div className="team-modal-header">
              <div>
                <h2 id="team-modal-title">
                  {editingId !== null ? "Edit team member" : "Add team member"}
                </h2>
                <p>Enter the employee details below.</p>
              </div>

              <button
                type="button"
                className="team-icon-button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  maxLength={150}
                />
              </label>

              <label>
                Job role
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Department
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Development"
                  required
                  maxLength={100}
                />
              </label>

              <div className="team-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId !== null ? "Save changes" : "Add member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
