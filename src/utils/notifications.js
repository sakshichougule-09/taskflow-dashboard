
const INBOX_KEY = "taskflow-inbox";

export function addTaskNotification(
  title,
  message,
  type = "task",
  taskId = null
) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(INBOX_KEY) || "[]"
    );

    const notifications = Array.isArray(saved) ? saved : [];

    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      message,
      type,
      taskId,
      time: new Date().toLocaleString("en-IN"),
      read: false,
    };

    localStorage.setItem(
      INBOX_KEY,
      JSON.stringify([notification, ...notifications])
    );

    window.dispatchEvent(new Event("taskflow-inbox-updated"));

    return notification;
  } catch (error) {
    console.error("Could not save task notification:", error);
    return null;
  }
}
