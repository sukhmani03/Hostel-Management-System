import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../pages/student/StudentDashboard.css"; 

const StudentSidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2>Hostel</h2>

      <Link className={location.pathname === "/student" ? "active" : ""} to="/student">
        Dashboard
      </Link>

      <Link to="/student/gatepass">Gate Pass</Link>
      <Link to="/student/fees">Fees Status</Link>
      <Link to="/student/room">My Room</Link>
      <Link to="/student/complaints">My Complaints</Link>
      <Link to="/student/mess">Mess</Link>
    </div>
  );
};

export default StudentSidebar;