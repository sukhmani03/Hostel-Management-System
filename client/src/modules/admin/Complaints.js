import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/api';

// ===== Status tabs =====
const TABS = ['All', 'pending', 'in_progress', 'resolved'];

// ===== Priority badge colors =====
const PRIORITY_COLORS = {
  high:   { bg: '#fee2e2', color: '#991b1b' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low:    { bg: '#d1fae5', color: '#065f46' },
};

// ===== Status badge colors =====
const STATUS_COLORS = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  resolved:    { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
  rejected:    { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

const Badge = ({ text, style }) => (
  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', ...style }}>
    {text}
  </span>
);

// ===== Helper: extract room number from a populated complaint =====
const getRoomNumber = (complaint) => {
  const roomNumber =
    complaint.studentId?.roomId?.roomNumber ||
    complaint.student?.roomId?.roomNumber;
  return roomNumber ? `Room ${roomNumber}` : '—';
};

// ===== Complaints Page =====
const ComplaintsPage = () => {
  const [complaints, setComplaints]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('All');
  const [selected, setSelected]       = useState(null); // Complaint for detail modal
  const [adminNote, setAdminNote]     = useState('');
  const [newStatus, setNewStatus]     = useState('');
  const [saving, setSaving]           = useState(false);

  // ===== Fetch complaints =====
  const fetchComplaints = useCallback(async () => {
    try {
      const params = activeTab !== 'All' ? { status: activeTab } : {};
      const res = await complaintService.getAll(params);
      const payload = res.data?.data;
      setComplaints(Array.isArray(payload) ? payload : (payload?.complaints || []));
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ===== Open detail modal =====
  const openDetail = (complaint) => {
    setSelected(complaint);
    setAdminNote(complaint.adminNote || '');
    setNewStatus(complaint.status || 'pending');
  };

  const closeDetail = () => {
    setSelected(null);
    setAdminNote('');
    setNewStatus('');
  };

  // ===== Save status update =====
  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await complaintService.update(selected._id, {
        status: newStatus,
        adminNote,
      });
      toast.success('Complaint updated!');
      closeDetail();
      fetchComplaints();
    } catch {
      toast.error('Failed to update complaint');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete complaint =====
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await complaintService.remove(id);
      toast.success('Complaint deleted');
      fetchComplaints();
    } catch {
      toast.error('Failed to delete complaint');
    }
  };

  // ===== Filter by active tab (client-side fallback) =====
  const filtered = activeTab === 'All'
    ? complaints
    : complaints.filter((c) => c.status === activeTab);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>📋 Complaints</h2>
        <span style={{ color: '#64748b', fontSize: '13px' }}>
          {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Status Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setLoading(true); }}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab === 'All' ? 'All' : tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>No complaints found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((complaint) => {
                  const priority = PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS.low;
                  const status   = STATUS_COLORS[complaint.status]     || STATUS_COLORS.pending;
                  return (
                    <tr
                      key={complaint._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openDetail(complaint)}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{complaint.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {complaint.description}
                        </div>
                      </td>
                      <td>
                        {complaint.student?.name || complaint.studentId?.name || complaint.studentName || '—'}
                      </td>
                      <td>
                        {getRoomNumber(complaint)}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {complaint.category || '—'}
                      </td>
                      <td>
                        <Badge
                          text={complaint.priority || 'low'}
                          style={{ background: priority.bg, color: priority.color }}
                        />
                      </td>
                      <td>
                        <Badge
                          text={status.label}
                          style={{ background: status.bg, color: status.color }}
                        />
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {complaint.createdAt
                          ? new Date(complaint.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => handleDelete(complaint._id, e)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Detail / Update Modal ===== */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="modal-close" onClick={closeDetail}>✕</button>
            </div>

            {/* Complaint Info */}
            <div style={styles.detailGrid}>
              <InfoRow label="Title"    value={selected.title} />
              <InfoRow label="Student"  value={selected.studentId?.name || selected.student?.name || selected.studentName || '—'} />
              <InfoRow
                label="Room"
                value={getRoomNumber(selected)}
              />
              <InfoRow label="Category" value={selected.category || '—'} />
              <InfoRow label="Priority" value={selected.priority || '—'} />
              <InfoRow
                label="Date"
                value={selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '13px' }}>
                Description
              </label>
              <p style={styles.descBox}>{selected.description || 'No description provided.'}</p>
            </div>

            {/* Status Update */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
              <label>Update Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Admin Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
              <label>Admin Note</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note for the student..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={closeDetail}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Reusable detail row =====
const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '6px' }}>
    <span style={{ fontWeight: 600, color: '#475569', minWidth: '80px' }}>{label}:</span>
    <span style={{ color: '#1e293b' }}>{value}</span>
  </div>
);

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    background: 'white',
    padding: '6px',
    borderRadius: '10px',
    width: 'fit-content',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  tab: {
    padding: '7px 18px',
    border: 'none',
    borderRadius: '7px',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: '#1a73e8',
    color: 'white',
    fontWeight: '600',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  detailGrid: {
    background: '#f8faff',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '16px',
  },
  descBox: {
    background: '#f8faff',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.6',
  },
};

export default ComplaintsPage;
