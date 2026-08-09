import React from "react";

const StudentProfileCard = ({ student, room, displayStudentId, formatDate }) => {
  const roomLabel = room?.roomNumber
    ? `Room ${room.roomNumber}${room?.roomType ? ` (${room.roomType})` : ""}`
    : "-";
  const academicYear = student?.academicYear || student?.semester || "-";
  const checkInDate = formatDate ? formatDate(room?.checkInDate) : room?.checkInDate || "-";

  return (
    <div className="profile-card">
      <div className="profile-header">
        <span className="profile-icon">👤</span>
        <h3>Student Profile</h3>
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <p><strong>Full Name</strong><br />{student?.name || "-"}</p>
          <p><strong>Email</strong><br />{student?.email || "-"}</p>
          <p><strong>Student ID</strong><br />{displayStudentId || "-"}</p>
          <p><strong>Course</strong><br />{student?.course || "-"}</p>
          <p><strong>Academic Year</strong><br />{academicYear}</p>
        </div>

        <div className="profile-right">
          <p>
            <strong>Room</strong><br />
            {roomLabel}
            {room?.status === "Allocated" && (
              <span className="badge">Allocated</span>
            )}
          </p>
          <p><strong>Check-in Date</strong><br />{checkInDate}</p>
          <p><strong>Phone</strong><br />{student?.phone || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileCard;