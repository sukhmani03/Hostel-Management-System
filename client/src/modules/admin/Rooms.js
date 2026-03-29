import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { roomService } from '../../services/api';
import { getUser } from '../../utils/auth';

// ===== Empty form template =====
const EMPTY_FORM = {
  roomNumber: '', type: 'single', isAC: false,
  totalBeds: 1, floor: 1, rent: '', status: 'available', description: '',
};

// ===== Status color map =====
const STATUS_COLORS = {
  available:   { bg: '#d1fae5', color: '#065f46', label: 'Available' },
  occupied:    { bg: '#fee2e2', color: '#991b1b', label: 'Occupied' },
  maintenance: { bg: '#fef3c7', color: '#92400e', label: 'Maintenance' },
};

// ===== Room Card Component (Admin) =====
const RoomCard = ({ room, onEdit, onDelete }) => {
  const status = STATUS_COLORS[room.status] || STATUS_COLORS.available;
  return (
    <div style={cardStyles.card}>
      {/* Room number & status badge */}
      <div style={cardStyles.top}>
        <span style={cardStyles.roomNo}>Room {room.roomNumber}</span>
        <span style={{ ...cardStyles.badge, background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div style={cardStyles.details}>
        <Detail icon="🏢" label={`Floor ${room.floor}`} />
        <Detail icon="🛏️" label={`${room.totalBeds} Bed${room.totalBeds !== 1 ? 's' : ''} (${room.type})`} />
        <Detail icon="❄️" label={room.isAC ? 'AC' : 'Non-AC'} />
        <Detail icon="💰" label={`₹${(room.rent || 0).toLocaleString()}/mo`} />
      </div>

      {room.description && (
        <p style={cardStyles.desc}>{room.description}</p>
      )}

      {/* Action buttons */}
      <div style={cardStyles.actions}>
        <button className="btn btn-primary btn-sm" onClick={() => onEdit(room)}>
          ✏️ Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(room._id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

// ===== Room Card Component (Warden - status update only) =====
const WardenRoomCard = ({ room, onRefresh }) => {
  const [status, setStatus] = useState(room.status || 'available');
  const [saving, setSaving] = useState(false);
  const current = STATUS_COLORS[status] || STATUS_COLORS.available;

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await roomService.update(room._id, { status });
      toast.success(`Room ${room.roomNumber} status updated to ${current.label}`);
      onRefresh();
    } catch {
      toast.error('Failed to update room status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyles.card}>
      {/* Room number & current status badge */}
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

      {room.description && (
        <p style={cardStyles.desc}>{room.description}</p>
      )}

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
  <span style={cardStyles.detail}>
    {icon} {label}
  </span>
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
    background: '#f8faff',
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
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
};

// ===== Main Rooms Page =====
const RoomsPage = () => {
  const user = getUser();
  const isWarden = user?.role === 'warden';

  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // Filters
  const [filterType,   setFilterType]   = useState('');
  const [filterAC,     setFilterAC]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ===== Fetch rooms =====
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

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ===== Modals =====
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setForm({
      roomNumber:  room.roomNumber  || '',
      type:        room.type        || 'single',
      isAC:        room.isAC        || false,
      totalBeds:   room.totalBeds   || 1,
      floor:       room.floor       || 1,
      rent:        room.rent        || '',
      status:      room.status      || 'available',
      description: room.description || '',
    });
    setEditId(room._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  // ===== Save =====
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.roomNumber) {
      toast.error('Room number is required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await roomService.update(editId, form);
        toast.success('Room updated!');
      } else {
        await roomService.create(form);
        toast.success('Room added!');
      }
      closeModal();
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomService.remove(id);
      toast.success('Room deleted');
      fetchRooms();
    } catch {
      toast.error('Failed to delete room');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>🛏️ {isWarden ? 'Room Status' : 'Rooms'}</h2>
        {!isWarden && (
          <button className="btn btn-primary" onClick={openAdd}>
            ➕ Add Room
          </button>
        )}
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
          <option value="">AC & Non-AC</option>
          <option value="ac">AC Only</option>
          <option value="nonac">Non-AC Only</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>
          {rooms.length} room{rooms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="spinner" />
      ) : rooms.length === 0 ? (
        <div className="card" style={styles.empty}>
          No rooms found.{!isWarden && ' Add a room to get started!'}
        </div>
      ) : (
        <div style={styles.grid}>
          {rooms.map((room) =>
            isWarden ? (
              <WardenRoomCard
                key={room._id}
                room={room}
                onRefresh={fetchRooms}
              />
            ) : (
              <RoomCard
                key={room._id}
                room={room}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

      {/* ===== Add / Edit Modal (admin only) ===== */}
      {showModal && !isWarden && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Room' : 'Add New Room'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={styles.formGrid}>
                {/* Room Number */}
                <div style={styles.field}>
                  <label>Room Number *</label>
                  <input
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    placeholder="101"
                  />
                </div>

                {/* Floor */}
                <div style={styles.field}>
                  <label>Floor</label>
                  <input
                    type="number"
                    min="0"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                  />
                </div>

                {/* Type */}
                <div style={styles.field}>
                  <label>Room Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>

                {/* Total Beds */}
                <div style={styles.field}>
                  <label>Total Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalBeds}
                    onChange={(e) => setForm({ ...form, totalBeds: Number(e.target.value) })}
                  />
                </div>

                {/* Rent */}
                <div style={styles.field}>
                  <label>Monthly Rent (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.rent}
                    onChange={(e) => setForm({ ...form, rent: e.target.value })}
                    placeholder="5000"
                  />
                </div>

                {/* Status */}
                <div style={styles.field}>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* AC Checkbox */}
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={form.isAC}
                      onChange={(e) => setForm({ ...form, isAC: e.target.checked })}
                    />
                    Air-Conditioned (AC) Room
                  </label>
                </div>

                {/* Description */}
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '48px',
  },
};

export default RoomsPage;
