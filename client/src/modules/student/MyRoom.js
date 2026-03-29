import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { studentService } from '../../services/api';

/**
 * MyRoom - Allows a student to view their assigned room details.
 */
const MyRoom = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getMyProfile();
        setStudent(res.data?.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="spinner" />;

  const room = student?.roomId;

  return (
    <div>
      <h2 style={styles.pageTitle}>🛏️ My Room</h2>

      {!room ? (
        <div style={styles.notAssigned}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>No Room Assigned</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Please contact the admin to get a room assigned to you.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Room Details Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.roomNumber}>Room {room.roomNumber}</span>
              <span style={{
                ...styles.statusBadge,
                background: room.status === 'available' ? '#d1fae5' : room.status === 'occupied' ? '#fee2e2' : '#fef3c7',
                color:      room.status === 'available' ? '#065f46' : room.status === 'occupied' ? '#991b1b' : '#92400e',
              }}>
                {room.status}
              </span>
            </div>

            <div style={styles.detailsGrid}>
              <DetailItem icon="🏢" label="Floor" value={`Floor ${room.floor}`} />
              <DetailItem icon="🛏️" label="Room Type" value={room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : 'N/A'} />
              <DetailItem icon="❄️" label="Air Conditioning" value={room.isAC ? 'Yes (AC Room)' : 'No (Non-AC)'} />
              <DetailItem icon="👥" label="Total Beds" value={room.totalBeds ?? 'N/A'} />
              <DetailItem icon="🔢" label="Occupied Beds" value={room.occupiedBeds ?? 'N/A'} />
              <DetailItem icon="✅" label="Available Beds" value={room.totalBeds != null && room.occupiedBeds != null ? room.totalBeds - room.occupiedBeds : 'N/A'} />
              <DetailItem icon="💰" label="Monthly Rent" value={room.rent != null ? `₹${room.rent.toLocaleString()}` : 'N/A'} />
            </div>

            {room.description && (
              <div style={styles.descriptionBox}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Description: </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{room.description}</span>
              </div>
            )}
          </div>

          {/* Student Details Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 My Profile</h3>
            <div style={styles.detailsGrid}>
              <DetailItem icon="🎓" label="Name"           value={student.name} />
              <DetailItem icon="📧" label="Email"          value={student.email} />
              <DetailItem icon="📚" label="Course"         value={student.course} />
              <DetailItem icon="🆔" label="Roll Number"    value={student.rollNumber || 'N/A'} />
              <DetailItem icon="📞" label="Phone"          value={student.phone || 'N/A'} />
              <DetailItem icon="👪" label="Parent Contact" value={student.parentContact || 'N/A'} />
              <DetailItem
                icon="📅"
                label="Admission Date"
                value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
              />
            </div>
            {student.address && (
              <div style={styles.descriptionBox}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Address: </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{student.address}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Reusable Detail Item =====
const DetailItem = ({ icon, label, value }) => (
  <div style={detailStyles.item}>
    <span style={detailStyles.icon}>{icon}</span>
    <div>
      <div style={detailStyles.label}>{label}</div>
      <div style={detailStyles.value}>{String(value)}</div>
    </div>
  </div>
);

const detailStyles = {
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  icon: { fontSize: '18px', marginTop: '1px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' },
  value: { fontSize: '14px', fontWeight: '500', color: '#1e293b', marginTop: '1px' },
};

const styles = {
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
  },
  notAssigned: {
    background: 'white',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
  },
  roomNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '999px',
    textTransform: 'capitalize',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
  },
  descriptionBox: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '14px',
  },
};

export default MyRoom;
