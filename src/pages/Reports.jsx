import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Reports() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedTasks = JSON.parse(
          localStorage.getItem("taskflow-tasks") || "[]"
        );
        setTasks(Array.isArray(savedTasks) ? savedTasks : []);
      } catch {
        setTasks([]);
      }
    };

    loadTasks();

    window.addEventListener("taskflow-tasks-updated", loadTasks);
    window.addEventListener("storage", loadTasks);

    return () => {
      window.removeEventListener("taskflow-tasks-updated", loadTasks);
      window.removeEventListener("storage", loadTasks);
    };
  }, []);

  const getStatus = (task) =>
    String(task.status || "To Do").toLowerCase();

  const completed = tasks.filter((task) =>
    ["completed", "done"].includes(getStatus(task))
  ).length;

  const inProgress = tasks.filter((task) =>
    ["in progress", "in-progress", "inprogress"].includes(
      getStatus(task)
    )
  ).length;

  const todo = tasks.filter((task) =>
    ["to do", "todo", "pending"].includes(getStatus(task))
  ).length;

  const other = tasks.length - completed - inProgress - todo;

  const chartData = [
    { name: "To Do", count: todo },
    { name: "In Progress", count: inProgress },
    { name: "Completed", count: completed },
    { name: "Other", count: other },
  ];

  const completionRate =
    tasks.length > 0
      ? Math.round((completed / tasks.length) * 100)
      : 0;

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      color: "#6366f1",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "#16a34a",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "#d97706",
    },
    {
      title: "To Do",
      value: todo,
      icon: AlertCircle,
      color: "#dc2626",
    },
  ];

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Track your team's task performance and progress.</p>
        </div>
        <div className="reports-icon">
          <BarChart3 size={25} />
        </div>
      </div>

      <div className="reports-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="report-stat-card" key={stat.title}>
              <div
                className="report-stat-icon"
                style={{ color: stat.color }}
              >
                <Icon size={23} />
              </div>
              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="reports-content">
        <section className="report-chart-card">
          <h3>Task Status Overview</h3>
          <p>Number of tasks in each status</p>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="report-progress-card">
          <h3>Completion Rate</h3>
          <p>Percentage of tasks completed</p>

          <div
            className="completion-circle"
            style={{
              background: `conic-gradient(#16a34a ${
                completionRate * 3.6
              }deg, #e5e7eb 0deg)`,
            }}
          >
            <div className="completion-circle-inner">
              <strong>{completionRate}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <p className="completion-summary">
            {completed} of {tasks.length} tasks completed
          </p>
        </section>
      </div>
    </div>
  );
}

export default Reports;