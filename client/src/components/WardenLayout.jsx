import { Link, Outlet, useLocation } from "react-router-dom";
import "../pages/warden/WardenDashboard.css"; // Reusing admin styles for now, can create separate warden CSS later

export default function WardenLayout() {
  const location = useLocation();

  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Warden Panel</h2>

        <nav>
          <Link 
            to="/warden/dashboard"
            className={location.pathname.includes("dashboard") ? "active" : ""}
          >
            Dashboard
          </Link>

          <Link 
            to="/warden/students"
            className={location.pathname.includes("students") ? "active" : ""}
          >
            Students
          </Link>

          <Link 
            to="/warden/rooms"
            className={location.pathname.includes("rooms") ? "active" : ""}
          >
            Rooms
          </Link>

          <Link 
            to="/warden/mess"
            className={location.pathname.includes("mess") ? "active" : ""}
          >
            Mess
          </Link>

          <Link 
            to="/warden/complaints"
            className={location.pathname.includes("complaints") ? "active" : ""}
          >
            Complaints
          </Link>

          <Link 
            to="/warden/notifications"
            className={location.pathname.includes("notifications") ? "active" : ""}
          >
            Notifications
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}