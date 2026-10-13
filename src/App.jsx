import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Plus,
  Menu,
  X,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import TeamMembers from "./pages/TeamMembers";
import Notes from "./pages/Notes";
import Reports from "./pages/Reports";
import Inbox from "./pages/Inbox";

import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openTaskId, setOpenTaskId] = useState(null);

  function handleNavigation(page) {
    setActivePage(page);
    setMobileSidebarOpen(false);
  }

  useEffect(() => {
    const handleTaskNavigation = (event) => {
      setActivePage(event.detail?.page || "My Tasks");
      setMobileSidebarOpen(false);
    };

    const handleOpenTask = (event) => {
      const taskId = event.detail?.taskId;

      if (taskId !== undefined && taskId !== null) {
        setOpenTaskId(taskId);
        setActivePage("My Tasks");
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener(
      "taskflow-navigate",
      handleTaskNavigation
    );

    window.addEventListener(
      "taskflow-open-task",
      handleOpenTask
    );

    return () => {
      window.removeEventListener(
        "taskflow-navigate",
        handleTaskNavigation
      );

      window.removeEventListener(
        "taskflow-open-task",
        handleOpenTask
      );
    };
  }, []);

  // Close the mobile sidebar with the Escape key.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Prevent background scrolling while the mobile sidebar is open.
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container ${
          mobileSidebarOpen ? "mobile-open" : ""
        }`}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigation}
          collapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed((previous) => !previous)
          }
        />

        {/* Mobile close button */}
        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main content */}
      <main
        className={`main-area ${
          sidebarCollapsed ? "expanded" : ""
        }`}
      >
        {/* Top navigation */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              type="button"
              onClick={() =>
                setMobileSidebarOpen((previous) => !previous)
              }
              aria-label={
                mobileSidebarOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileSidebarOpen}
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-workspace">
                Workspace
              </span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Global search */}
            <label className="global-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                aria-label="Search workspace"
              />
            </label>

            {/* Create task */}
            <button
              type="button"
              className="primary-button topbar-create-button"
              onClick={() => handleNavigation("My Tasks")}
            >
              <Plus size={18} />
              <span>Create task</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="main-content">
          {activePage === "Dashboard" ? (
            <Dashboard />
          ) : activePage === "My Tasks" ? (
            <Tasks
              searchQuery={searchQuery}
              openTaskId={openTaskId}
              onTaskOpened={() => setOpenTaskId(null)}
            />
          ) : activePage === "Calendar" ? (
            <Calendar />
          ) : activePage === "Team Members" ? (
            <TeamMembers />
          ) : activePage === "Notes" ? (
            <Notes />
          ) : activePage === "Reports" ? (
            <Reports />
          ) : activePage === "Inbox" ? (
            <Inbox />
          ) : (
            <div className="coming-soon-panel">
              <h3>{activePage}</h3>
              <p>
                This section will be developed in the next steps.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <span>TaskFlow © 2026</span>
          <span>Built for better teamwork</span>
        </footer>
      </main>
    </div>
  );
}
