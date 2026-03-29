import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { studentService, paymentService } from '../../services/api';

/**
 * MyPayments - Students can view fee history, pay dues, and download receipts.
 */
const MyPayments = () => {
  const [student, setStudent]   = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [form, setForm] = useState({ amount: '', month: '', description: '' });

  // ===== Load student profile and payment history =====
  const fetchData = useCallback(async () => {
    try {
      const profileRes = await studentService.getMyProfile();
      const studentData = profileRes.data?.data;
      setStudent(studentData);

      if (studentData?._id) {
        const payRes = await paymentService.getHistory(studentData._id);
        setPayments(Array.isArray(payRes.data?.data) ? payRes.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== Handle fee payment request =====
  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.month) {
      toast.error('Please fill in Amount and Month');
      return;
    }
    if (!student?._id) {
      toast.error('Student profile not found');
      return;
    }
    setPaying(true);
    try {
      await paymentService.create({
        studentId: student._id,
        amount: Number(form.amount),
        month: form.month,
        description: form.description,
        status: 'pending',
      });
      toast.success('Payment request submitted! Admin will confirm your payment.');
      setShowPayForm(false);
      setForm({ amount: '', month: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment request failed');
    } finally {
      setPaying(false);
    }
  };

  // ===== Download receipt as printable HTML =====
  const downloadReceipt = (payment) => {
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
    .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { font-size: 32px; }
    h1 { font-size: 24px; margin: 8px 0 4px; }
    .subtitle { color: #64748b; font-size: 14px; }
    .receipt-id { background: #f0f9ff; border: 1px solid #bae6fd; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: 600; color: #0369a1; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    td:first-child { font-weight: 600; color: #475569; width: 40%; }
    .status { background: #d1fae5; color: #065f46; padding: 2px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
    .amount-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0; }
    .amount-box .amount { font-size: 32px; font-weight: 700; color: #15803d; }
    .amount-box .label { font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏠</div>
    <h1>HostelMS</h1>
    <p class="subtitle">Hostel Management System</p>
    <p class="subtitle">Fee Payment Receipt</p>
  </div>

  <p style="text-align:center;margin-bottom:8px;">
    <span class="receipt-id">Receipt ID: ${payment._id}</span>
  </p>

  <div class="amount-box">
    <div class="label">Amount Paid</div>
    <div class="amount">₹${payment.amount?.toLocaleString()}</div>
  </div>

  <table>
    <tr><td>Student Name</td><td>${student?.name || 'N/A'}</td></tr>
    <tr><td>Roll Number</td><td>${student?.rollNumber || 'N/A'}</td></tr>
    <tr><td>Email</td><td>${student?.email || 'N/A'}</td></tr>
    <tr><td>Course</td><td>${student?.course || 'N/A'}</td></tr>
    <tr><td>Room Number</td><td>${student?.roomId?.roomNumber || 'N/A'}</td></tr>
    <tr><td>Fee Month</td><td>${payment.month || 'N/A'}</td></tr>
    <tr><td>Description</td><td>${payment.description || 'Hostel Fee'}</td></tr>
    <tr><td>Payment Date</td><td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : new Date(payment.createdAt).toLocaleString()}</td></tr>
    <tr><td>Status</td><td><span class="status">${payment.status?.toUpperCase()}</span></td></tr>
    ${payment.razorpayPaymentId ? `<tr><td>Transaction ID</td><td>${payment.razorpayPaymentId}</td></tr>` : ''}
  </table>

  <div class="footer">
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `receipt_${payment.month?.replace(/\s/g, '_') || payment._id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  if (loading) return <div className="spinner" />;

  const totalPaid    = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>💳 Fees &amp; Payments</h2>
        <button className="btn btn-primary" onClick={() => setShowPayForm(true)}>
          + Request Fee Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <SummaryCard label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} color="#10b981" icon="✅" />
        <SummaryCard label="Pending Dues" value={`₹${totalPending.toLocaleString()}`} color={totalPending > 0 ? '#ef4444' : '#10b981'} icon="⏳" />
        <SummaryCard label="Total Records" value={payments.length} color="#1a73e8" icon="📄" />
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {payments.length === 0 ? (
          <div style={styles.empty}>No payment records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Month / Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{payment.month || 'Hostel Fee'}</div>
                      {payment.description && (
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{payment.description}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: payment.status === 'paid' ? '#d1fae5' : '#fef3c7',
                        color:      payment.status === 'paid' ? '#065f46' : '#92400e',
                      }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      {payment.status === 'paid' ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => downloadReceipt(payment)}
                          title="Download Receipt"
                        >
                          ⬇️ Receipt
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Fee Modal */}
      {showPayForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>Pay Fee</h2>
              <button className="modal-close" onClick={() => setShowPayForm(false)}>✕</button>
            </div>
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={styles.field}>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div style={styles.field}>
                <label>Fee Month *</label>
                <input
                  type="text"
                  placeholder="e.g. January 2024"
                  value={form.month}
                  onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
                  required
                />
              </div>
              <div style={styles.field}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel fee, Mess fee"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPayForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={paying}>
                  {paying ? 'Submitting...' : 'Submit Payment Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Summary Card =====
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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

export default MyPayments;
