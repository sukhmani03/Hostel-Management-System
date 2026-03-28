import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { complaintService, studentService } from '../../services/api';

const CATEGORIES = ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'];
const PRIORITIES  = ['low', 'medium', 'high'];

const STATUS_STYLES = {
  pending:     { bg: '#fef3c7', color: '#92400e' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  resolved:    { bg: '#d1fae5', color: '#065f46' },
};

const PRIORITY_STYLES = {
  low:    { bg: '#f0fdf4', color: '#166534' },
  medium: { bg: '#fefce8', color: '#854d0e' },
  high:   { bg: '#fff1f2', color: '#9f1239' },
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId]   = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  // Fetch the student's own profile to get their studentId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getMe();
        setStudentId(res.data?.data?._id);
      } catch {
        toast.error('Could not load your student profile');
      }
    };
    fetchProfile();
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintService.getMy();
      setComplaints(res.data?.data || []);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Student profile not found. Please contact admin.');
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await complaintService.create({ ...form, studentId });
      toast.success('Complaint submitted successfully!');
      setForm({ title: '', description: '', category: 'other', priority: 'medium' });
      setShowForm(false);
      fetchComplaints();
    } catch {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Complaints</h1>
        <button style={styles.raiseBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Raise Complaint'}
        </button>
      </div>

      {/* Raise complaint form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>New Complaint</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Brief title for your complaint" style={styles.input} />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.label}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} style={styles.input}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your complaint in detail..."
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      {/* Complaints list */}
      {loading ? (
        <div style={styles.loading}>Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p>No complaints submitted yet.</p>
          <button style={styles.raiseBtn} onClick={() => setShowForm(true)}>Raise your first complaint</button>
        </div>
      ) : (
        <div style={styles.list}>
          {complaints.map((c) => (
            <div key={c._id} style={styles.complaintCard}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.cardTitle}>{c.title}</span>
                  <span style={styles.cardCategory}> · {c.category}</span>
                </div>
                <div style={styles.badges}>
                  <span style={{ ...styles.badge, background: PRIORITY_STYLES[c.priority]?.bg, color: PRIORITY_STYLES[c.priority]?.color }}>
                    {c.priority}
                  </span>
                  <span style={{ ...styles.badge, background: STATUS_STYLES[c.status]?.bg, color: STATUS_STYLES[c.status]?.color }}>
                    {c.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p style={styles.cardDesc}>{c.description}</p>
              {c.adminNote && (
                <div style={styles.adminNote}>
                  <strong>Admin note:</strong> {c.adminNote}
                </div>
              )}
              <div style={styles.cardFooter}>
                Submitted: {new Date(c.createdAt).toLocaleDateString()}
                {c.resolvedAt && ` · Resolved: ${new Date(c.resolvedAt).toLocaleDateString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: '900px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b' },
  raiseBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  formTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '18px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: {
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    minWidth: '160px',
  },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#64748b', background: 'white', borderRadius: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  complaintCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
  cardCategory: { fontSize: '13px', color: '#64748b' },
  badges: { display: 'flex', gap: '6px' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  cardDesc: { fontSize: '14px', color: '#475569', margin: '6px 0 10px', lineHeight: '1.5' },
  adminNote: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '10px',
  },
  cardFooter: { fontSize: '12px', color: '#94a3b8' },
};

export default MyComplaints;
