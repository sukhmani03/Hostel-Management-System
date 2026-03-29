import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { paymentService } from '../../services/api';

const STATUS_STYLES = {
  paid:    { bg: '#d1fae5', color: '#065f46' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

const MyFees = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await paymentService.getMy();
        setPayments(res.data?.data || []);
      } catch {
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div style={styles.loading}>Loading payments...</div>;

  const totalPaid    = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Fees & Payments</h1>

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.summaryAmount}>₹{totalPaid.toLocaleString()}</div>
          <div style={styles.summaryLabel}>Total Paid</div>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.summaryAmount}>₹{totalPending.toLocaleString()}</div>
          <div style={styles.summaryLabel}>Total Pending</div>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #3b82f6' }}>
          <div style={styles.summaryAmount}>{payments.length}</div>
          <div style={styles.summaryLabel}>Total Records</div>
        </div>
      </div>

      {/* Payment history table */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Payment History</h2>
        {payments.length === 0 ? (
          <p style={styles.empty}>No payment records found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Month', 'Amount', 'Status', 'Payment Date', 'Description'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>{p.month}</td>
                    <td style={styles.td}>₹{p.amount?.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: STATUS_STYLES[p.status]?.bg || '#f3f4f6', color: STATUS_STYLES[p.status]?.color || '#374151' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={styles.td}>{p.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: '900px' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  summaryCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  summaryAmount: { fontSize: '22px', fontWeight: '700', color: '#1e293b' },
  summaryLabel: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  empty: { textAlign: 'center', color: '#64748b', padding: '20px 0' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px', fontSize: '14px', color: '#374151' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
};

export default MyFees;
