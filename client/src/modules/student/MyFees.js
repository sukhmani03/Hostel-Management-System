import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { paymentService, studentService } from '../../services/api';

const STATUS_STYLES = {
  paid:    { bg: '#d1fae5', color: '#065f46' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

// ===== Load Razorpay checkout script =====
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ===== Generate & open a printable receipt in a new window =====
const openReceipt = (payment, student) => {
  const receiptId = payment.razorpayPaymentId || payment._id;
  const paidDate  = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const roomLabel = student?.roomId
    ? `Room ${student.roomId.roomNumber || student.roomId}`
    : '—';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt – HostelMS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 32px 16px; }
    .receipt { background: white; max-width: 560px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .top { background: linear-gradient(135deg, #064e3b, #10b981); padding: 28px 32px; color: white; }
    .top h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .top p { font-size: 13px; opacity: 0.8; }
    .amount-box { background: #f0fdf4; text-align: center; padding: 24px; border-bottom: 1px dashed #a7f3d0; }
    .amount-label { font-size: 13px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-value { font-size: 36px; font-weight: 800; color: #059669; }
    .body { padding: 24px 32px; }
    .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; }
    .row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #64748b; }
    .row .val { font-weight: 600; color: #1e293b; text-align: right; max-width: 60%; word-break: break-all; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 3px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .footer { background: #f8fafc; padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .print-btn { display: block; width: 100%; margin: 20px 0 0; padding: 13px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="top">
      <h1>🏠 HostelMS</h1>
      <p>Hostel Management System — Payment Receipt</p>
    </div>
    <div class="amount-box">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">₹${(payment.amount || 0).toLocaleString('en-IN')}</div>
    </div>
    <div class="body">
      <div class="section-title">Receipt Details</div>
      <div class="row"><span class="lbl">Receipt No.</span><span class="val">${receiptId}</span></div>
      <div class="row"><span class="lbl">Month</span><span class="val">${payment.month || '—'}</span></div>
      <div class="row"><span class="lbl">Payment Date</span><span class="val">${paidDate}</span></div>
      <div class="row"><span class="lbl">Description</span><span class="val">${payment.description || 'Hostel Fee'}</span></div>
      <div class="row"><span class="lbl">Status</span><span class="val"><span class="badge">Paid ✓</span></span></div>
      <div class="section-title">Student Details</div>
      <div class="row"><span class="lbl">Name</span><span class="val">${student?.name || '—'}</span></div>
      <div class="row"><span class="lbl">Roll Number</span><span class="val">${student?.rollNumber || '—'}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${student?.email || '—'}</span></div>
      <div class="row"><span class="lbl">Room</span><span class="val">${roomLabel}</span></div>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
    <div class="footer">
      <p>This is an automatically generated receipt. For queries, contact the hostel administration.</p>
      <p style="margin-top:4px">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=640,height=820');
  if (w) {
    w.opener = null;
    w.document.write(html);
    w.document.close();
    w.focus();
  } else {
    toast.error('Pop-up blocked. Please allow pop-ups to download receipt.');
  }
};

// ===== Main MyFees Component =====
const MyFees = () => {
  const [payments, setPayments] = useState([]);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [payingId, setPayingId] = useState(null); // ID of payment currently being processed

  const fetchData = useCallback(async () => {
    try {
      const [payRes, profRes] = await Promise.allSettled([
        paymentService.getMy(),
        studentService.getMe(),
      ]);
      if (payRes.status  === 'fulfilled') setPayments(payRes.value.data?.data  || []);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data?.data);
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ===== Initiate Razorpay payment =====
  const handlePay = async (payment) => {
    setPayingId(payment._id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setPayingId(null);
        return;
      }

      let orderData;
      try {
        const res = await paymentService.createOrder({
          amount:      payment.amount,
          studentId:   payment.studentId || profile?._id,
          month:       payment.month,
          description: payment.description,
        });
        orderData = res.data?.data;
      } catch (err) {
        if (err.response?.status === 503) {
          toast.warning('Payment gateway is not configured. Please contact the hostel admin to set up payments.');
        } else {
          toast.error(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
        }
        setPayingId(null);
        return;
      }

      const { order, keyId } = orderData;
      if (!keyId) {
        toast.error('Payment gateway configuration error. Please contact the admin.');
        setPayingId(null);
        return;
      }

      const options = {
        key:         keyId,
        amount:      order.amount,
        currency:    order.currency || 'INR',
        name:        'HostelMS',
        description: `Hostel fee for ${payment.month}`,
        order_id:    order.id,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('🎉 Payment successful! Receipt is now available.');
            fetchData();
          } catch {
            toast.error('Payment verification failed. Please contact the admin.');
          }
        },
        prefill: {
          name:  profile?.name  || '',
          email: profile?.email || '',
          contact: profile?.phone || '',
        },
        notes: { month: payment.month },
        theme: { color: '#10b981' },
        modal: { ondismiss: () => setPayingId(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      // payingId is reset via modal.ondismiss or after verification
    } catch (err) {
      toast.error('Payment failed. Please try again.');
      setPayingId(null);
    }
    // Note: do NOT include a finally block here — when Razorpay opens successfully
    // the async function exits but the modal is still open; setPayingId is handled
    // by ondismiss (user closes) or by the handler callback (payment success).
  };

  if (loading) return <div style={styles.loading}>Loading payments...</div>;

  const totalPaid    = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>💳 My Fees & Payments</h1>

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.summaryAmount}>₹{totalPaid.toLocaleString('en-IN')}</div>
          <div style={styles.summaryLabel}>Total Paid</div>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.summaryAmount}>₹{totalPending.toLocaleString('en-IN')}</div>
          <div style={styles.summaryLabel}>Total Pending</div>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #3b82f6' }}>
          <div style={styles.summaryAmount}>{payments.length}</div>
          <div style={styles.summaryLabel}>Total Records</div>
        </div>
      </div>

      {/* Payment history */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Payment History</h2>
        {payments.length === 0 ? (
          <p style={styles.empty}>No payment records found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Month', 'Amount', 'Status', 'Payment Date', 'Description', 'Action'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>{p.month}</td>
                    <td style={styles.td}>₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: STATUS_STYLES[p.status]?.bg || '#f3f4f6', color: STATUS_STYLES[p.status]?.color || '#374151' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={styles.td}>{p.description || '—'}</td>
                    <td style={styles.td}>
                      {p.status === 'pending' ? (
                        <button
                          style={{ ...styles.actionBtn, background: '#10b981', color: 'white' }}
                          onClick={() => handlePay(p)}
                          disabled={payingId === p._id}
                          title="Pay this fee now"
                        >
                          {payingId === p._id ? '⏳ Processing...' : '💳 Pay Now'}
                        </button>
                      ) : (
                        <button
                          style={{ ...styles.actionBtn, background: '#3b82f6', color: 'white' }}
                          onClick={() => openReceipt(p, profile)}
                          title="Download payment receipt"
                        >
                          🧾 Receipt
                        </button>
                      )}
                    </td>
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
  page: { maxWidth: '960px' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
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
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    borderBottom: '2px solid #f1f5f9',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px', fontSize: '14px', color: '#374151' },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

export default MyFees;
