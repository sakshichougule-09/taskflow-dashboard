import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STORAGE_KEY = "taskflow-tasks";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    function loadTasks() {
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

        setTasks(Array.isArray(parsedTasks) ? parsedTasks : []);
      } catch (error) {
        console.error("Error loading tasks:", error);
        setTasks([]);
      }
    }

    // Load tasks when the Dashboard opens.
    loadTasks();

    // Refresh when the browser tab becomes active.
    window.addEventListener("focus", loadTasks);

    // Refresh when another browser tab updates tasks.
    window.addEventListener("storage", loadTasks);

    // Refresh when this app updates tasks.
    window.addEventListener("taskflow-tasks-updated", loadTasks);

    return () => {
      window.removeEventListener("focus", loadTasks);
      window.removeEventListener("storage", loadTasks);
      window.removeEventListener("taskflow-tasks-updated", loadTasks);
    };
  }, []);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;

  const chartData = [
    {
      name: "Completed",
      value: completedTasks,
      color: "#22c55e",
    },
    {
      name: "In Progress",
      value: inProgressTasks,
      color: "#6558e8",
    },
    {
      name: "Pending",
      value: pendingTasks,
      color: "#f59e0b",
    },
  ];

  const statistics = [
    {
      title: "Total Tasks",
      value: totalTasks,
      description: "All tasks in your workspace",
      icon: ListTodo,
      color: "purple",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      description: "Tasks currently underway",
      icon: Clock3,
      color: "blue",
    },
    {
      title: "Completed",
      value: completedTasks,
      description: "Successfully completed",
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Pending",
      value: pendingTasks,
      description: "Tasks waiting to begin",
      icon: AlertCircle,
      color: "orange",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-label">WORKSPACE OVERVIEW</span>

          <h2>Welcome back! 👋</h2>

          <p>Track your team's progress and stay on top of your work.</p>
        </div>

        <div className="dashboard-welcome-icon">
          <TrendingUp size={36} />
        </div>
      </div>

      {/* Statistics cards */}
      <div className="dashboard-statistics">
        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="dashboard-stat-card" key={stat.title}>
              <div className={"dashboard-stat-icon " + stat.color}>
                <Icon size={22} />
              </div>

              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
              <span>{stat.description}</span>
            </article>
          );
        })}
      </div>

      {/* Task progress chart */}
      <div className="dashboard-chart-card">
        <div className="dashboard-chart-heading">
          <div>
            <h3>Task Progress</h3>
            <p>Overview of your current task status</p>
          </div>

          <span className="dashboard-chart-total">{totalTasks} tasks</span>
        </div>

        {totalTasks === 0 ? (
          <div className="dashboard-empty">
            <ListTodo size={38} />

            <h4>No tasks available yet</h4>

            <p>Create your first task in My Tasks to see your statistics.</p>
          </div>
        ) : (
          <>
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-legend">
              {chartData.map((item) => (
                <div className="dashboard-legend-item" key={item.name}>
                  <span
                    className="dashboard-legend-dot"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
