import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { studentService, complaintService } from '../../services/api';

// ===== Status badge colors =====
const STATUS_COLORS = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  resolved:    { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
  rejected:    { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

// ===== Priority badge colors =====
const PRIORITY_COLORS = {
  high:   { bg: '#fee2e2', color: '#991b1b' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low:    { bg: '#d1fae5', color: '#065f46' },
};

const CATEGORIES = ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'];
const PRIORITIES  = ['low', 'medium', 'high'];

const emptyForm = { title: '', description: '', category: 'other', priority: 'low' };

/**
 * MyComplaints - Students can raise new complaints and view existing ones.
 */
const MyComplaints = () => {
  const [student, setStudent]       = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected]     = useState(null);

  // ===== Fetch complaints =====
  const fetchData = useCallback(async () => {
    try {
      const profileRes = await studentService.getMyProfile();
      const studentData = profileRes.data?.data;
      setStudent(studentData);

      if (studentData?._id) {
        const res = await complaintService.getAll({ studentId: studentData._id });
        setComplaints(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== Submit new complaint =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }
    if (!student?._id) {
      toast.error('Student profile not found');
      return;
    }
    setSubmitting(true);
    try {
      await complaintService.create({
        studentId: student._id,
        ...form,
      });
      toast.success('Complaint submitted successfully!');
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const openCount     = complaints.filter((c) => c.status === 'pending' || c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div>
      {/* Page Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>📋 My Complaints</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Raise Complaint
        </button>
      </div>

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total" value={complaints.length} color="#1a73e8" icon="📋" />
        <SummaryCard label="Open" value={openCount} color={openCount > 0 ? '#f59e0b' : '#10b981'} icon="⏳" />
        <SummaryCard label="Resolved" value={resolvedCount} color="#10b981" icon="✅" />
      </div>

      {/* Complaints List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {complaints.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
            <p>No complaints found. Click &ldquo;Raise Complaint&rdquo; to submit one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => {
                  const status   = STATUS_COLORS[complaint.status]   || STATUS_COLORS.pending;
                  const priority = PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS.low;
                  return (
                    <tr key={complaint._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{complaint.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {complaint.description}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{complaint.category || '—'}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', background: priority.bg, color: priority.color }}>
                          {complaint.priority || 'low'}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelected(complaint)}
                        >
                          View
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

      {/* Raise Complaint Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Raise a Complaint</h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setForm(emptyForm); }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={styles.field}>
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Brief title of the issue"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div style={styles.field}>
                <label>Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.field}>
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setForm(emptyForm); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Complaint Detail Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InfoRow label="Title"       value={selected.title} />
              <InfoRow label="Category"    value={selected.category} />
              <InfoRow label="Priority"    value={selected.priority} />
              <InfoRow label="Status"      value={STATUS_COLORS[selected.status]?.label || selected.status} />
              <InfoRow label="Date"        value={selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'} />
              {selected.resolvedAt && (
                <InfoRow label="Resolved On" value={new Date(selected.resolvedAt).toLocaleString()} />
              )}
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>DESCRIPTION</div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {selected.description || 'No description provided.'}
                </p>
              </div>
              {selected.adminNote && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1', marginBottom: '6px' }}>ADMIN NOTE</div>
                  <p style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.6', margin: 0 }}>{selected.adminNote}</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Reusable Components =====
const SummaryCard = ({ label, value, color, icon }) => (
  <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</div>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
    <span style={{ fontWeight: 600, color: '#475569', minWidth: '100px' }}>{label}:</span>
    <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{value}</span>
  </div>
);

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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
};

export default MyComplaints;
