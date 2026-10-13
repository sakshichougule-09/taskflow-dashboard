
import { useEffect, useMemo, useState } from "react";
import { addTaskNotification } from "../utils/notifications";
import {
  Plus,
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleDashed,
  Circle,
  Pencil,
  Trash2,
  X,
  ListTodo,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "taskflow-tasks";

const initialTasks = [
  {
    id: 1,
    title: "Design the dashboard UI",
    description: "Create a clean and responsive dashboard interface.",
    priority: "High",
    status: "In Progress",
    dueDate: "",
    assignee: "Sakshi",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build employee management",
    description: "Create employee records and management screens.",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    assignee: "Sakshi",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Test task workflows",
    description: "Verify task creation, editing, and status updates.",
    priority: "Low",
    status: "Completed",
    dueDate: "",
    assignee: "Sakshi",
    createdAt: new Date().toISOString(),
  },
];

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
  assignee: "Sakshi",
};

const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks !== null) {
      const parsedTasks = JSON.parse(savedTasks);
      return Array.isArray(parsedTasks) ? parsedTasks : initialTasks;
    }

    return initialTasks;
  } catch (error) {
    console.error("Unable to load tasks:", error);
    return initialTasks;
  }
}

function formatDate(dateString) {
  if (!dateString) return "No due date";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${task.dueDate}T00:00:00`) < today;
}

function StatusIcon({ status }) {
  if (status === "Completed") return <CheckCircle2 size={17} />;
  if (status === "In Progress") return <CircleDashed size={17} />;

  return <Circle size={17} />;
}

export default function Tasks({
  searchQuery = "",
  openTaskId = null,
  onTaskOpened = () => {},
}) {
  const [tasks, setTasks] = useState(loadTasks);
  const [search, setSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [view, setView] = useState("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new Event("taskflow-tasks-updated"));
    } catch (error) {
      console.error("Unable to save tasks:", error);
    }
  }, [tasks]);

  const taskCounts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = [
        task.title,
        task.description,
        task.assignee,
        task.priority,
        task.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function openEditForm(task) {
    setEditingId(task.id);

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      dueDate: task.dueDate || "",
      assignee: task.assignee || "",
    });

    setFormError("");
    setFormErrors({});
    setIsFormOpen(true);
  }

  useEffect(() => {
    if (openTaskId === null || openTaskId === undefined) return;

    const task = tasks.find(
      (item) => String(item.id) === String(openTaskId)
    );

    if (task) {
      setSearch("");
      setStatusFilter("All");
      setPriorityFilter("All");
      setView("list");
      openEditForm(task);
    } else {
      window.alert(
        "This task could not be found. It may have been deleted."
      );
    }

    localStorage.removeItem("taskflow-open-task-id");
    onTaskOpened();
  }, [openTaskId]);

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormErrors({});
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setFormError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const errors = {};
    const title = form.title.trim();
    const assignee = form.assignee.trim();

    // Validate only the required fields.
    // Description and due date are optional.
    if (!title) {
      errors.title = "Please enter a task title.";
    }

    if (!priorities.includes(form.priority)) {
      errors.priority = "Please select a valid priority.";
    }

    if (!statuses.includes(form.status)) {
      errors.status = "Please select a valid status.";
    }

    if (!assignee) {
      errors.assignee = "Please enter an assignee name.";
    }

    setFormErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) return;

    const taskData = {
      ...form,
      title,
      description: form.description.trim(),
      assignee,
    };

    if (editingId !== null) {
      const existingTask = tasks.find(
        (task) => String(task.id) === String(editingId)
      );

      if (!existingTask) {
        setFormError("The task could not be found.");
        return;
      }

      setTasks((previous) =>
        previous.map((task) =>
          String(task.id) === String(editingId)
            ? { ...task, ...taskData }
            : task
        )
      );

      if (existingTask.status !== taskData.status) {
        addTaskNotification(
          "Task status updated",
          `"${taskData.title}" changed from ${existingTask.status} to ${taskData.status}.`,
          "task",
          existingTask.id
        );
      } else {
        addTaskNotification(
          "Task updated",
          `"${taskData.title}" has been updated.`,
          "task",
          existingTask.id
        );
      }
    } else {
      const newTask = {
        ...taskData,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };

      setTasks((previous) => [newTask, ...previous]);

      addTaskNotification(
        "New task created",
        `"${newTask.title}" has been added to My Tasks.`,
        "task",
        newTask.id
      );
    }

    closeForm();
  }

  function deleteTask(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) return;

    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  }

  function updateStatus(id, status) {
    const existingTask = tasks.find(
      (task) => String(task.id) === String(id)
    );

    if (!existingTask || existingTask.status === status) return;

    setTasks((previous) =>
      previous.map((task) =>
        String(task.id) === String(id)
          ? { ...task, status }
          : task
      )
    );

    addTaskNotification(
      "Task status updated",
      `"${existingTask.title}" changed from ${existingTask.status} to ${status}.`,
      "task",
      existingTask.id
    );
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  return (
    <section className="tasks-page">
      <div className="tasks-heading">
        <div>
          <p className="eyebrow">WORK MANAGEMENT</p>
          <h1>My Tasks</h1>
          <p className="tasks-subtitle">
            Plan your work, manage priorities, and track your progress.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          New task
        </button>
      </div>

      <div className="task-stats">
        <article className="task-stat-card">
          <span className="task-stat-icon purple">
            <ListTodo size={20} />
          </span>
          <div>
            <p>Total tasks</p>
            <strong>{taskCounts.total}</strong>
          </div>
        </article>

        <article className="task-stat-card">
          <span className="task-stat-icon orange">
            <Circle size={20} />
          </span>
          <div>
            <p>Pending</p>
            <strong>{taskCounts.pending}</strong>
          </div>
        </article>

        <article className="task-stat-card">
          <span className="task-stat-icon blue">
            <Clock3 size={20} />
          </span>
          <div>
            <p>In progress</p>
            <strong>{taskCounts.inProgress}</strong>
          </div>
        </article>

        <article className="task-stat-card">
          <span className="task-stat-icon green">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p>Completed</p>
            <strong>{taskCounts.completed}</strong>
          </div>
        </article>
      </div>

      <div className="tasks-panel">
        <div className="tasks-toolbar">
          <label className="tasks-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks or assignees..."
              aria-label="Search tasks"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority} priority
              </option>
            ))}
          </select>

          <div className="task-view-toggle">
            <button
              type="button"
              className={view === "list" ? "selected" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
              title="List view"
            >
              <ListTodo size={18} />
            </button>

            <button
              type="button"
              className={view === "grid" ? "selected" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        <div className="tasks-results-bar">
          <span>
            Showing <strong>{filteredTasks.length}</strong> of{" "}
            <strong>{tasks.length}</strong> tasks
          </span>

          {(search ||
            statusFilter !== "All" ||
            priorityFilter !== "All") && (
            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="tasks-empty-state">
            <span className="empty-state-icon">
              <ListTodo size={28} />
            </span>

            <h3>
              {tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks"}
            </h3>

            <p>
              {tasks.length === 0
                ? "Create your first task to get your workflow started."
                : "Try another search or change your filters."}
            </p>

            {tasks.length === 0 ? (
              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                <Plus size={17} />
                Create your first task
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : view === "list" ? (
          <div className="tasks-table-wrap">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="task-title-cell">
                      <strong>{task.title}</strong>
                      <span>{task.description || "No description"}</span>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                      >
                        <span />
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`status-select ${task.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task.id, event.target.value)
                        }
                        aria-label={`Update status for ${task.title}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span
                        className={`due-date ${
                          isOverdue(task) ? "overdue" : ""
                        }`}
                      >
                        {isOverdue(task) && <AlertCircle size={14} />}
                        <CalendarDays size={14} />
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td>
                      <span className="assignee-name">
                        <span className="assignee-avatar">
                          {(task.assignee || "?").charAt(0).toUpperCase()}
                        </span>
                        {task.assignee || "Unassigned"}
                      </span>
                    </td>

                    <td>
                      <div className="task-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(task)}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete-action"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="task-card-grid">
            {filteredTasks.map((task) => (
              <article className="task-board-card" key={task.id}>
                <div className="task-card-top">
                  <span
                    className={`priority-badge ${task.priority.toLowerCase()}`}
                  >
                    <span />
                    {task.priority}
                  </span>

                  <div className="task-actions">
                    <button
                      type="button"
                      onClick={() => openEditForm(task)}
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3>{task.title}</h3>
                <p>{task.description || "No description provided."}</p>

                <label className="card-status-label">
                  Task status
                  <select
                    className={`status-select ${task.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    value={task.status}
                    onChange={(event) =>
                      updateStatus(task.id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="task-card-footer">
                  <span>
                    <CalendarDays size={14} />
                    {formatDate(task.dueDate)}
                  </span>

                  <span className="assignee-avatar">
                    {(task.assignee || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="task-modal-header">
              <div>
                <p className="eyebrow">
                  {editingId !== null
                    ? "UPDATE WORK ITEM"
                    : "NEW WORK ITEM"}
                </p>

                <h2 id="task-modal-title">
                  {editingId !== null ? "Edit task" : "Create a task"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Task title — required */}
              <label className="task-form-field">
                <span className="task-form-label">
                  Task title <span className="required-star">*</span>
                </span>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Complete project report"
                  autoFocus
                  maxLength={120}
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={
                    formErrors.title ? "title-error" : undefined
                  }
                />

                {formErrors.title && (
                  <p
                    id="title-error"
                    className="task-form-error"
                    role="alert"
                  >
                    {formErrors.title}
                  </p>
                )}
              </label>

              {/* Description — optional */}
              <label className="task-form-field">
                <span className="task-form-label">Description</span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="What needs to be done?"
                  rows={3}
                  maxLength={1000}
                />
              </label>

              <div className="task-form-row">
                {/* Priority — required */}
                <label className="task-form-field">
                  <span className="task-form-label">
                    Priority <span className="required-star">*</span>
                  </span>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    aria-invalid={Boolean(formErrors.priority)}
                    aria-describedby={
                      formErrors.priority ? "priority-error" : undefined
                    }
                  >
                    <option value="">Select priority</option>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  {formErrors.priority && (
                    <p
                      id="priority-error"
                      className="task-form-error"
                      role="alert"
                    >
                      {formErrors.priority}
                    </p>
                  )}
                </label>

                {/* Status — required */}
                <label className="task-form-field">
                  <span className="task-form-label">
                    Status <span className="required-star">*</span>
                  </span>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    aria-invalid={Boolean(formErrors.status)}
                    aria-describedby={
                      formErrors.status ? "status-error" : undefined
                    }
                  >
                    <option value="">Select status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {formErrors.status && (
                    <p
                      id="status-error"
                      className="task-form-error"
                      role="alert"
                    >
                      {formErrors.status}
                    </p>
                  )}
                </label>
              </div>

              <div className="task-form-row">
                {/* Due date — optional, no date validation */}
                <label className="task-form-field">
                  <span className="task-form-label">Due date</span>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                  />
                </label>

                {/* Assignee — required */}
                <label className="task-form-field">
                  <span className="task-form-label">
                    Assignee <span className="required-star">*</span>
                  </span>

                  <input
                    type="text"
                    name="assignee"
                    value={form.assignee}
                    onChange={handleFormChange}
                    placeholder="Employee name"
                    maxLength={80}
                    aria-invalid={Boolean(formErrors.assignee)}
                    aria-describedby={
                      formErrors.assignee ? "assignee-error" : undefined
                    }
                  />

                  {formErrors.assignee && (
                    <p
                      id="assignee-error"
                      className="task-form-error"
                      role="alert"
                    >
                      {formErrors.assignee}
                    </p>
                  )}
                </label>
              </div>

              {formError && (
                <p className="task-form-error" role="alert">
                  <AlertCircle size={15} />
                  {formError}
                </p>
              )}

              <div className="task-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId !== null ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
