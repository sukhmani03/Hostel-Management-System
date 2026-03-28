import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { paymentService, studentService } from '../../services/api';

// ===== Empty payment form =====
const EMPTY_FORM = {
  studentId: '', amount: '', month: '', status: 'paid', description: '',
};

// ===== Status badge =====
const StatusBadge = ({ status }) => {
  const map = {
    paid:    { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
    pending: { bg: '#fee2e2', color: '#991b1b', label: 'Pending' },
    partial: { bg: '#fef3c7', color: '#92400e', label: 'Partial' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ ...badgeStyle, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const badgeStyle = {
  padding: '3px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
};

// ===== Payments Page =====
const PaymentsPage = () => {
  const [payments, setPayments]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // ===== Fetch data =====
  const fetchPayments = useCallback(async () => {
    try {
      const res = await paymentService.getAll();
      const payload = res.data?.data;
      setPayments(Array.isArray(payload) ? payload : (payload?.payments || []));
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentService.getAll();
      const payload = res.data?.data;
      setStudents(Array.isArray(payload) ? payload : (payload?.students || []));
    } catch {
      // Students dropdown will be empty
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [fetchPayments, fetchStudents]);

  // ===== Save payment =====
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.month) {
      toast.error('Student, amount and month are required');
      return;
    }
    setSaving(true);
    try {
      await paymentService.create(form);
      toast.success('Payment recorded!');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  // ===== Summary stats =====
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>💳 Payments</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            📥 Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Add Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <div className="card" style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div>
            <div style={styles.summaryValue}>₹{totalCollected.toLocaleString()}</div>
            <div style={styles.summaryLabel}>Total Collected</div>
          </div>
        </div>
        <div className="card" style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⏳</div>
          <div>
            <div style={{ ...styles.summaryValue, color: '#ea4335' }}>
              ₹{totalPending.toLocaleString()}
            </div>
            <div style={styles.summaryLabel}>Pending Amount</div>
          </div>
        </div>
        <div className="card" style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div>
            <div style={styles.summaryValue}>{payments.length}</div>
            <div style={styles.summaryLabel}>Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" />
        ) : payments.length === 0 ? (
          <div style={styles.empty}>No payments recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr key={payment._id}>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {payment.student?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {payment.student?.rollNumber || ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>
                      ₹{(payment.amount || 0).toLocaleString()}
                    </td>
                    <td>{payment.month || '—'}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : '—'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b', maxWidth: '200px' }}>
                      {payment.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Add Payment Modal ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Student dropdown */}
              <div style={styles.field}>
                <label>Student *</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                >
                  <option value="">— Select Student —</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.rollNumber ? `(${s.rollNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div style={styles.field}>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 5000"
                />
              </div>

              {/* Month */}
              <div style={styles.field}>
                <label>Month *</label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                />
              </div>

              {/* Status */}
              <div style={styles.field}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {/* Description */}
              <div style={styles.field}>
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Monthly rent for June"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Record Payment'}
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
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  summaryIcon: {
    fontSize: '30px',
    width: '50px',
    height: '50px',
    background: '#f8faff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#34a853',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
};

export default PaymentsPage;
