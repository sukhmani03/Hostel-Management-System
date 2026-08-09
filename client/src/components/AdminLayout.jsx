import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../pages/admin/AdminDashboard.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openRooms, setOpenRooms] = useState(false);
  const [openMenu, setOpenMenu] = useState("");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Smart</h2>

        <ul>
          <li
            className={location.pathname === "/admin" ? "active" : ""}
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </li>

          <li onClick={() => navigate("/admin/employees")}>
            Employees
          </li>

          <li
            className={location.pathname.includes("/admin/students") ? "active" : ""}
            onClick={() => navigate("/admin/students")}
          >
            Students
          </li>

          <li
            className="dropdown"
            onClick={() => setOpenRooms(!openRooms)}
          >
            <span>Rooms</span>
            {openRooms && <span className="arrow">▾</span>}
          </li>

          {openRooms && (
            <ul className="submenu">
              <li
                className={location.pathname === "/admin/rooms" ? "active" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/rooms");
                }}
              >
                Manage Rooms
              </li>

              <li
                className={location.pathname === "/admin/allocate-room" ? "active" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/allocate-room");
                }}
              >
                Allocate Room
              </li>

              <li
                className={location.pathname === "/admin/accommodation" ? "active" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/accommodation");
                }}
              >
                Student Accommodation
              </li>
            </ul>
          )}

          <li
            className="dropdown"
            onClick={() => toggleMenu("fees")}
          >
            <span>Fees</span>
            {openMenu === "fees" && <span className="arrow">▾</span>}
          </li>

          {openMenu === "fees" && (
            <ul className="submenu">
              <li
                className={
                  location.pathname === "/admin/fees/collection" ? "active" : ""
                }
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/fees/collection");
                }}
              >
                Fees Collection
              </li>

              <li
                className={
                  location.pathname === "/admin/fees/add" ? "active" : ""
                }
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/fees/add");
                }}
              >
                Add Fees
              </li>
            </ul>
          )}

          <li onClick={() => navigate("/admin/complaints")}>
            Complaints
          </li>

          <li
            className={location.pathname === "/admin/mess" ? "active" : ""}
            onClick={() => navigate("/admin/mess")}
          >
            Mess
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        <Outlet />
      </div>

    </div>
  );
}

export default AdminLayout;