
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  Trash2,
  Inbox as InboxIcon,
  Sparkles,
} from "lucide-react";
import "./Inbox.css";

const INBOX_KEY = "taskflow-inbox";

const initialNotifications = [
  {
    id: "welcome-taskflow",
    title: "Welcome to TaskFlow",
    message: "Your employee task management dashboard is ready.",
    type: "general",
    time: "Just now",
    read: false,
    taskId: null,
  },
  {
    id: "task-management",
    title: "Task management",
    message: "Create tasks and track their progress from My Tasks.",
    type: "task",
    time: "Just now",
    read: false,
    taskId: null,
  },
  {
    id: "stay-organized",
    title: "Stay organized",
    message: "Use Calendar and Notes to organize your work.",
    type: "general",
    time: "Just now",
    read: true,
    taskId: null,
  },
];

function loadNotifications() {
  try {
    const saved = localStorage.getItem(INBOX_KEY);

    if (saved === null) return initialNotifications;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load inbox notifications:", error);
    return [];
  }
}

function Inbox() {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (localStorage.getItem(INBOX_KEY) === null) {
      localStorage.setItem(
        INBOX_KEY,
        JSON.stringify(initialNotifications)
      );
    }

    const refreshInbox = () => {
      setNotifications(loadNotifications());
    };

    window.addEventListener("taskflow-inbox-updated", refreshInbox);
    window.addEventListener("storage", refreshInbox);

    return () => {
      window.removeEventListener("taskflow-inbox-updated", refreshInbox);
      window.removeEventListener("storage", refreshInbox);
    };
  }, []);

  const updateNotifications = (updater) => {
    const updated =
      typeof updater === "function"
        ? updater(notifications)
        : updater;

    setNotifications(updated);

    try {
      localStorage.setItem(INBOX_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("taskflow-inbox-updated"));
    } catch (error) {
      console.error("Could not save inbox notifications:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const visibleNotifications = notifications.filter((notification) => {
    if (filter === "Unread") return !notification.read;
    if (filter === "Read") return notification.read;
    return true;
  });

  const markAsRead = (id) => {
    updateNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === String(id)
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    updateNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    updateNotifications((current) =>
      current.filter(
        (notification) => String(notification.id) !== String(id)
      )
    );
  };

  const clearInbox = () => {
    updateNotifications([]);
  };

  const restoreMessages = () => {
    updateNotifications(
      initialNotifications.map((notification) => ({
        ...notification,
        read: false,
      }))
    );
  };

  // Clicking a message only marks it as read.
  // It does not open a task or navigate to another page.
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getIcon = (type) => {
    if (type === "task") return ClipboardList;
    if (type === "deadline") return Clock;
    return Bell;
  };

  return (
    <div className="inbox-page">
      <header className="inbox-heading">
        <div className="inbox-heading-icon">
          <Bell size={25} />
        </div>

        <div className="inbox-heading-text">
          <h2>Inbox</h2>
          <p>All your task updates and notifications in one place.</p>
        </div>

        <div className="inbox-count">
          <span className="inbox-count-dot" />
          <span>{unreadCount} unread</span>
        </div>
      </header>

      

      <section className="inbox-panel">
        <div className="inbox-toolbar">
          <div className="inbox-filters">
            {["All", "Unread", "Read"].map((item) => (
              <button
                key={item}
                type="button"
                className={`inbox-filter ${
                  filter === item ? "active" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "Unread" && unreadCount > 0 && (
                  <span className="inbox-filter-count">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="inbox-actions">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              title="Mark all notifications as read"
            >
              <CheckCheck size={16} />
              <span>Mark all read</span>
            </button>

            <button
              type="button"
              onClick={restoreMessages}
              title="Restore example notifications"
            >
              <Bell size={16} />
              <span>Restore</span>
            </button>

            <button
              type="button"
              className="inbox-clear-button"
              onClick={clearInbox}
              disabled={notifications.length === 0}
              title="Clear all notifications"
            >
              <Trash2 size={16} />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        <div className="inbox-list">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((notification) => {
              const Icon = getIcon(notification.type);

              return (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.read ? "read" : "unread"
                  }`}
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                >
                  <div
                    className={`notification-icon ${
                      notification.type || "general"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>{notification.title}</h3>

                      {!notification.read && (
                        <span
                          className="notification-unread-dot"
                          title="Unread notification"
                        />
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="notification-meta">
                      <Clock size={14} />
                      <span>{notification.time}</span>
                      {!notification.read && (
                        <span className="notification-new-label">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="notification-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {!notification.read && (
                      <button
                        type="button"
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="notification-delete"
                      title="Delete notification"
                      aria-label="Delete notification"
                      onClick={() =>
                        deleteNotification(notification.id)
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="inbox-empty">
              <div className="inbox-empty-icon">
                <InboxIcon size={34} />
              </div>
              <h3>No notifications found</h3>
              <p>
                {filter === "Unread"
                  ? "You're all caught up! There are no unread notifications."
                  : filter === "Read"
                  ? "You don't have any read notifications yet."
                  : "Your inbox is empty. New task updates will appear here."}
              </p>
              {filter !== "All" && (
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <footer className="inbox-footer">
            Showing {visibleNotifications.length} of{" "}
            {notifications.length} notifications
          </footer>
        )}
      </section>
    </div>
  );
}

export default Inbox;
