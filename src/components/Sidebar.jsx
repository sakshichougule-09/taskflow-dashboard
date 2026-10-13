import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  ChartNoAxesCombined,
  Users,
  Building2,
  NotebookPen,
  Inbox,
  Puzzle,
  Settings,
  Check,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navigationGroups = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "My Tasks", icon: CheckSquare },
      { label: "Calendar", icon: CalendarDays },
      { label: "Reports", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Team Members", icon: Users },
      ,
      { label: "Notes", icon: NotebookPen },
      { label: "Inbox", icon: Inbox },
    ],
  },
];

export default function Sidebar({
  activePage = "Dashboard",
  onNavigate,
  collapsed = false,
  onToggle,
}) {
  const handleNavigate = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  };
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("taskflow-inbox") || "[]",
      );
      return notifications.filter((item) => !item.read).length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const updateUnreadCount = () => {
      try {
        const notifications = JSON.parse(
          localStorage.getItem("taskflow-inbox") || "[]",
        );
        setUnreadCount(notifications.filter((item) => !item.read).length);
      } catch {
        setUnreadCount(0);
      }
    };

    updateUnreadCount();
    window.addEventListener("taskflow-inbox-updated", updateUnreadCount);
    window.addEventListener("storage", updateUnreadCount);

    return () => {
      window.removeEventListener("taskflow-inbox-updated", updateUnreadCount);
      window.removeEventListener("storage", updateUnreadCount);
    };
  }, []);
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Check size={23} strokeWidth={3} />
        </div>

        {!collapsed && (
          <div className="brand-name">
            <strong>TaskFlow</strong>
            <span>WORKSPACE</span>
          </div>
        )}

        {typeof onToggle === "function" && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation" aria-label="Main navigation">
        {navigationGroups.map((group) => (
          <section className="navigation-group" key={group.title}>
            {!collapsed && <p className="navigation-heading">{group.title}</p>}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.label;

              return (
                <button
                  type="button"
                  key={item.label}
                  title={collapsed ? item.label : undefined}
                  className={`navigation-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavigate(item.label)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={19} strokeWidth={1.9} />

                  {!collapsed && <span>{item.label}</span>}

                  {item.label === "Inbox" && !collapsed && unreadCount > 0 && (
                    <span className="navigation-badge">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </section>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom"></div>
    </aside>
  );
}
