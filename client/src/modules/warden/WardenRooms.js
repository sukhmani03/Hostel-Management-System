import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { roomService } from '../../services/api';

// ===== Status color map =====
const STATUS_COLORS = {
  available:   { bg: '#d1fae5', color: '#065f46', label: 'Available' },
  occupied:    { bg: '#fee2e2', color: '#991b1b', label: 'Occupied' },
  maintenance: { bg: '#fef3c7', color: '#92400e', label: 'Maintenance' },
};

// ===== Room Card (warden — status update only) =====
const RoomCard = ({ room, onRefresh }) => {
  const [status, setStatus] = useState(room.status || 'available');
  const [saving, setSaving] = useState(false);
  const current = STATUS_COLORS[status] || STATUS_COLORS.available;

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await roomService.update(room._id, { status });
      toast.success(`Room ${room.roomNumber} updated to ${current.label}`);
      onRefresh();
    } catch {
      toast.error('Failed to update room status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyles.card}>
      {/* Room number & current status */}
      <div style={cardStyles.top}>
        <span style={cardStyles.roomNo}>Room {room.roomNumber}</span>
        <span style={{ ...cardStyles.badge, background: current.bg, color: current.color }}>
          {current.label}
        </span>
      </div>

      {/* Details */}
      <div style={cardStyles.details}>
        <Detail icon="🏢" label={`Floor ${room.floor}`} />
        <Detail icon="🛏️" label={`${room.totalBeds} Bed${room.totalBeds !== 1 ? 's' : ''} (${room.type})`} />
        <Detail icon="❄️" label={room.isAC ? 'AC' : 'Non-AC'} />
      </div>

      {room.description && <p style={cardStyles.desc}>{room.description}</p>}

      {/* Status Update Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ flex: 1, fontSize: '13px' }}
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleStatusUpdate}
          disabled={saving || status === room.status}
          title={status === room.status ? 'Change status to enable update' : 'Save new room status'}
        >
          {saving ? '...' : 'Update'}
        </button>
      </div>
      {status === room.status && (
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
          Select a different status to update.
        </p>
      )}
    </div>
  );
};

const Detail = ({ icon, label }) => (
  <span style={cardStyles.detail}>{icon} {label}</span>
);

const cardStyles = {
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'box-shadow 0.2s',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomNo: {
    fontWeight: '700',
    fontSize: '16px',
    color: '#1e293b',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  detail: {
    background: '#f0fdf4',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
  },
  desc: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
};

// ===== Main Warden Rooms Page =====
const WardenRooms = () => {
  const [rooms, setRooms]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterType, setFilterType]   = useState('');
  const [filterAC, setFilterAC]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      const params = {};
      if (filterType)   params.type   = filterType;
      if (filterAC)     params.isAC   = filterAC === 'ac';
      if (filterStatus) params.status = filterStatus;
      const res = await roomService.getAll(params);
      const payload = res.data?.data;
      setRooms(Array.isArray(payload) ? payload : (payload?.rooms || []));
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterAC, filterStatus]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>🛏️ Room Status</h2>
        <span style={{ color: '#64748b', fontSize: '13px' }}>
          {rooms.length} room{rooms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="card" style={styles.filterBar}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={styles.filterSelect}>
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </select>

        <select value={filterAC} onChange={(e) => setFilterAC(e.target.value)} style={styles.filterSelect}>
          <option value="">AC &amp; Non-AC</option>
          <option value="ac">AC Only</option>
          <option value="nonac">Non-AC Only</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="spinner" />
      ) : rooms.length === 0 ? (
        <div className="card" style={styles.empty}>No rooms found.</div>
      ) : (
        <div style={styles.grid}>
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} onRefresh={fetchRooms} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  filterBar: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    width: 'auto',
    minWidth: '140px',
    padding: '8px 12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '48px',
  },
};

export default WardenRooms;
