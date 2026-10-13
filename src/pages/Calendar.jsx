import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "taskflow-tasks";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  useEffect(() => {
    function loadTasks() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        setTasks(Array.isArray(saved) ? saved : []);
      } catch (error) {
        console.error("Unable to load calendar tasks:", error);
        setTasks([]);
      }
    }

    loadTasks();

    window.addEventListener("focus", loadTasks);
    window.addEventListener("storage", loadTasks);
    window.addEventListener("taskflow-tasks-updated", loadTasks);

    return () => {
      window.removeEventListener("focus", loadTasks);
      window.removeEventListener("storage", loadTasks);
      window.removeEventListener("taskflow-tasks-updated", loadTasks);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(1);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(1);
  }

  function goToToday() {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today.getDate());
  }

  function getTaskDate(task) {
    const value = task.dueDate || task.date || task.deadline;

    if (typeof value !== "string" || !value) {
      return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (!match) {
      return null;
    }

    return {
      year: Number(match[1]),
      month: Number(match[2]) - 1,
      day: Number(match[3]),
    };
  }

  function tasksForDay(day) {
    return tasks.filter((task) => {
      const date = getTaskDate(task);

      return (
        date && date.year === year && date.month === month && date.day === day
      );
    });
  }

  const selectedTasks = tasksForDay(selectedDate);

  const calendarCells = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      key: `empty-${index}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  return (
    <div className="calendar-page">
      {/* Calendar introduction */}
      <div className="calendar-intro">
        <div>
          <span className="calendar-eyebrow">PLAN YOUR WORK</span>

          <h2>Task Calendar</h2>

          <p>View your deadlines and organize your schedule.</p>
        </div>

        <div className="calendar-intro-icon">
          <CalendarDays size={30} />
        </div>
      </div>

      <div className="calendar-layout">
        {/* Monthly calendar */}
        <section className="calendar-card">
          <div className="calendar-toolbar">
            <h3>{monthName}</h3>

            <div className="calendar-navigation">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>

              <button type="button" onClick={goToToday}>
                Today
              </button>

              <button type="button" onClick={nextMonth} aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {calendarCells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div
                    className="calendar-cell calendar-cell-empty"
                    key={cell.key}
                  />
                );
              }

              const dayTasks = tasksForDay(cell.day);
              const today = new Date();

              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === cell.day;

              return (
                <button
                  type="button"
                  key={cell.key}
                  className={[
                    "calendar-cell",
                    selectedDate === cell.day ? "selected" : "",
                    isToday ? "today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedDate(cell.day)}
                  aria-label={`${monthName} ${cell.day}, ${dayTasks.length} tasks`}
                  aria-pressed={selectedDate === cell.day}
                >
                  <span className="calendar-day-number">{cell.day}</span>

                  {dayTasks.length > 0 && (
                    <span className="calendar-task-indicators">
                      {dayTasks.slice(0, 3).map((task, index) => (
                        <span
                          key={task.id ?? `${task.title}-${index}`}
                          className={
                            task.status === "Completed"
                              ? "calendar-dot completed"
                              : task.status === "In Progress"
                                ? "calendar-dot in-progress"
                                : "calendar-dot pending"
                          }
                        />
                      ))}
                    </span>
                  )}

                  {dayTasks.length > 0 && (
                    <span className="calendar-day-count">
                      {dayTasks.length}{" "}
                      {dayTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span>
              <i className="legend-green" /> Completed
            </span>
            <span>
              <i className="legend-purple" /> In Progress
            </span>
            <span>
              <i className="legend-orange" /> Pending
            </span>
          </div>
        </section>

        {/* Selected date agenda */}
        <aside className="calendar-agenda">
          <div className="agenda-heading">
            <div>
              <h3>
                {new Date(year, month, selectedDate).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric" },
                )}
              </h3>

              <p>
                {selectedTasks.length} scheduled{" "}
                {selectedTasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>

            <CalendarDays size={22} />
          </div>

          {selectedTasks.length === 0 ? (
            <div className="agenda-empty">
              <CalendarDays size={34} />

              <h4>No tasks for this date</h4>

              <p>Select another date or add a task with a due date.</p>
            </div>
          ) : (
            <div className="agenda-task-list">
              {selectedTasks.map((task, index) => (
                <article
                  className="agenda-task"
                  key={task.id ?? `${task.title}-${index}`}
                >
                  <div
                    className={
                      "agenda-task-icon " +
                      (task.status === "Completed"
                        ? "completed"
                        : task.status === "In Progress"
                          ? "in-progress"
                          : "pending")
                    }
                  >
                    {task.status === "Completed" ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <Clock size={19} />
                    )}
                  </div>

                  <div className="agenda-task-info">
                    <h4>{task.title || "Untitled task"}</h4>

                    <p>{task.assignee || "Unassigned"}</p>

                    <span
                      className={
                        "agenda-status " +
                        (task.status === "Completed"
                          ? "completed"
                          : task.status === "In Progress"
                            ? "in-progress"
                            : "pending")
                      }
                    >
                      {task.status || "Pending"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
