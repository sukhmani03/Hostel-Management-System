import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService, paymentService, complaintService } from '../../services/api';

/**
 * Student Dashboard - Overview page showing room info, payment status, and complaints.
 */
const StudentDashboard = () => {
  const [student, setStudent]     = useState(null);
  const [payments, setPayments]   = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await studentService.getMyProfile();
        const studentData = profileRes.data?.data;
        setStudent(studentData);

        if (studentData?._id) {
          const [payRes, cmpRes] = await Promise.all([
            paymentService.getHistory(studentData._id),
            complaintService.getAll({ studentId: studentData._id }),
          ]);
          setPayments(Array.isArray(payRes.data?.data) ? payRes.data.data : []);
          setComplaints(Array.isArray(cmpRes.data?.data) ? cmpRes.data.data : []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" />;

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const openComplaints  = complaints.filter((c) => c.status !== 'resolved').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.welcomeTitle}>Welcome back, {student?.name || 'Student'}! 👋</h2>
          <p style={styles.welcomeSub}>
            {student?.course || 'Course not set'} &bull; Roll No: {student?.rollNumber || 'N/A'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🛏️"
          label="Room"
          value={student?.roomId?.roomNumber || 'Not Assigned'}
          sub={student?.roomId ? `Floor ${student.roomId.floor} — ${student.roomId.type}` : 'Contact admin for assignment'}
          color="#f59e0b"
          link="/student/my-room"
        />
        <StatCard
          icon="💳"
          label="Pending Dues"
          value={pendingPayments === 0 ? 'All Clear' : `${pendingPayments} Pending`}
          sub="Click to view payment history"
          color={pendingPayments > 0 ? '#ef4444' : '#10b981'}
          link="/student/payments"
        />
        <StatCard
          icon="📋"
          label="Open Complaints"
          value={openComplaints === 0 ? 'None' : `${openComplaints} Open`}
          sub="Click to view or raise complaint"
          color={openComplaints > 0 ? '#f59e0b' : '#10b981'}
          link="/student/complaints"
        />
      </div>

      {/* Recent Payments */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>💳 Recent Payments</h3>
          <Link to="/student/payments" style={styles.viewAllLink}>View All →</Link>
        </div>
        {payments.length === 0 ? (
          <p style={styles.emptyText}>No payment records found.</p>
        ) : (
          <div style={styles.listContainer}>
            {payments.slice(0, 3).map((payment) => (
              <div key={payment._id} style={styles.listItem}>
                <div>
                  <div style={styles.listItemTitle}>{payment.month || 'Hostel Fee'}</div>
                  <div style={styles.listItemSub}>{payment.description || ''}</div>
                </div>
                <div style={styles.listItemRight}>
                  <span style={styles.amount}>₹{payment.amount?.toLocaleString()}</span>
                  <span style={{
                    ...styles.badge,
                    background: payment.status === 'paid' ? '#d1fae5' : '#fef3c7',
                    color: payment.status === 'paid' ? '#065f46' : '#92400e',
                  }}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Complaints */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>📋 Recent Complaints</h3>
          <Link to="/student/complaints" style={styles.viewAllLink}>View All →</Link>
        </div>
        {complaints.length === 0 ? (
          <p style={styles.emptyText}>No complaints found.</p>
        ) : (
          <div style={styles.listContainer}>
            {complaints.slice(0, 3).map((complaint) => (
              <div key={complaint._id} style={styles.listItem}>
                <div>
                  <div style={styles.listItemTitle}>{complaint.title}</div>
                  <div style={styles.listItemSub}>{complaint.category} &bull; {complaint.priority} priority</div>
                </div>
                <span style={{
                  ...styles.badge,
                  background: complaint.status === 'resolved' ? '#d1fae5' : complaint.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                  color:      complaint.status === 'resolved' ? '#065f46' : complaint.status === 'in_progress' ? '#1e40af' : '#92400e',
                }}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== Stat Card Component =====
const StatCard = ({ icon, label, value, sub, color, link }) => (
  <Link to={link} style={{ textDecoration: 'none' }}>
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  </Link>
);

const styles = {
  welcomeBanner: {
    background: 'linear-gradient(135deg, #1e293b 0%, #f59e0b 100%)',
    borderRadius: '12px',
    padding: '24px 28px',
    marginBottom: '24px',
    color: 'white',
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  welcomeSub: {
    fontSize: '14px',
    opacity: 0.85,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  statSub: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
  },
  viewAllLink: {
    fontSize: '13px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: '600',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  listItemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  listItemSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  listItemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  amount: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 10px',
    borderRadius: '999px',
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center',
    padding: '16px 0',
  },
};

export default StudentDashboard;
