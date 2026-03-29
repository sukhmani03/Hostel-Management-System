import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { studentService } from '../../services/api';

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value || '—'}</span>
  </div>
);

const MyRoom = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await studentService.getMe();
        setProfile(res.data?.data);
      } catch {
        toast.error('Failed to load room information');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div style={styles.loading}>Loading room details...</div>;

  const room = profile?.roomId;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Room</h1>

      {!room ? (
        <div style={styles.noRoom}>
          <div style={styles.noRoomIcon}>🛏️</div>
          <h2 style={styles.noRoomTitle}>No Room Assigned</h2>
          <p style={styles.noRoomSub}>You have not been assigned a room yet. Please contact the hostel admin.</p>
        </div>
      ) : (
        <div style={styles.card}>
          {/* Room header */}
          <div style={styles.roomHeader}>
            <div>
              <h2 style={styles.roomNumber}>Room {room.roomNumber}</h2>
              <span style={{ ...styles.badge, background: room.status === 'available' ? '#d1fae5' : room.status === 'occupied' ? '#fee2e2' : '#fef3c7', color: room.status === 'available' ? '#065f46' : room.status === 'occupied' ? '#991b1b' : '#92400e' }}>
                {room.status}
              </span>
            </div>
            <div style={styles.roomIcon}>🏠</div>
          </div>

          {/* Room details */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailSection}>
              <h3 style={styles.detailSectionTitle}>Room Details</h3>
              <InfoRow label="Room Number" value={room.roomNumber} />
              <InfoRow label="Floor" value={room.floor !== undefined ? `Floor ${room.floor}` : '—'} />
              <InfoRow label="Type" value={room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : '—'} />
              <InfoRow label="Air Conditioned" value={room.isAC ? 'Yes ❄️' : 'No'} />
            </div>
            <div style={styles.detailSection}>
              <h3 style={styles.detailSectionTitle}>Capacity & Rent</h3>
              <InfoRow label="Total Beds" value={room.totalBeds} />
              <InfoRow label="Occupied Beds" value={room.occupiedBeds} />
              <InfoRow label="Available Beds" value={room.totalBeds - room.occupiedBeds} />
              <InfoRow label="Monthly Rent" value={room.rent ? `₹${room.rent.toLocaleString()}` : '—'} />
            </div>
          </div>

          {room.description && (
            <div style={styles.description}>
              <h3 style={styles.detailSectionTitle}>Description</h3>
              <p style={styles.descText}>{room.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: '800px' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  noRoom: {
    background: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  noRoomIcon: { fontSize: '64px', marginBottom: '16px' },
  noRoomTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  noRoomSub: { color: '#64748b', fontSize: '15px' },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
  },
  roomNumber: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' },
  badge: { padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  roomIcon: { fontSize: '48px' },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '20px',
  },
  detailSection: {},
  detailSectionTitle: { fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f8fafc',
  },
  infoLabel: { fontSize: '14px', color: '#64748b' },
  infoValue: { fontSize: '14px', fontWeight: '500', color: '#1e293b' },
  description: { marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  descText: { fontSize: '14px', color: '#475569', lineHeight: '1.6' },
};

export default MyRoom;
