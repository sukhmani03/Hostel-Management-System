import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService, complaintService, paymentService, attendanceService } from '../../services/api';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  </Link>
);

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({ summary: { total: 0, present: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profRes, compRes, payRes, attRes] = await Promise.allSettled([
          studentService.getMe(),
          complaintService.getMy(),
          paymentService.getMy(),
          attendanceService.getMy(),
        ]);

        if (profRes.status === 'fulfilled') setProfile(profRes.value.data?.data);
        if (compRes.status === 'fulfilled') setComplaints(compRes.value.data?.data || []);
        if (payRes.status === 'fulfilled') setPayments(payRes.value.data?.data || []);
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data?.data || { summary: { total: 0, present: 0, percentage: 0 } });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const pendingComplaints = complaints.filter((c) => c.status === 'pending').length;
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const attendancePct = attendance?.summary?.percentage || 0;

  return (
    <div style={styles.page}>
      {/* Welcome banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeTitle}>Welcome back, {profile?.name || 'Student'}! 👋</h1>
          <p style={styles.welcomeSub}>
            {profile?.course ? `${profile.course}` : 'Your hostel dashboard'}
            {profile?.rollNumber ? ` · Roll No: ${profile.rollNumber}` : ''}
          </p>
        </div>
        <div style={styles.roomBadge}>
          {profile?.roomId ? (
            <>🛏️ Room {profile.roomId.roomNumber}</>
          ) : (
            '⚠️ No room assigned'
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🛏️"
          label="Assigned Room"
          value={profile?.roomId ? `Room ${profile.roomId.roomNumber}` : 'Not Assigned'}
          color="#3b82f6"
          to="/student/my-room"
        />
        <StatCard
          icon="📋"
          label="Pending Complaints"
          value={pendingComplaints}
          color="#f59e0b"
          to="/student/complaints"
        />
        <StatCard
          icon="💳"
          label="Pending Payments"
          value={pendingPayments}
          color="#ef4444"
          to="/student/my-fees"
        />
        <StatCard
          icon="✅"
          label="Attendance"
          value={`${attendancePct}%`}
          color="#10b981"
          to="/student/attendance"
        />
      </div>

      {/* Recent complaints */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Complaints</h2>
          <Link to="/student/complaints" style={styles.viewAll}>View All →</Link>
        </div>
        {complaints.length === 0 ? (
          <p style={styles.empty}>No complaints yet. <Link to="/student/complaints">Raise one?</Link></p>
        ) : (
          <div style={styles.list}>
            {complaints.slice(0, 3).map((c) => (
              <div key={c._id} style={styles.listItem}>
                <div>
                  <span style={styles.listTitle}>{c.title}</span>
                  <span style={styles.listSub}> · {c.category}</span>
                </div>
                <span style={{ ...styles.badge, background: STATUS_BG[c.status] || '#f3f4f6', color: STATUS_COLOR[c.status] || '#374151' }}>
                  {c.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Payments</h2>
          <Link to="/student/my-fees" style={styles.viewAll}>View All →</Link>
        </div>
        {payments.length === 0 ? (
          <p style={styles.empty}>No payment records found.</p>
        ) : (
          <div style={styles.list}>
            {payments.slice(0, 3).map((p) => (
              <div key={p._id} style={styles.listItem}>
                <div>
                  <span style={styles.listTitle}>₹{p.amount}</span>
                  <span style={styles.listSub}> · {p.month}</span>
                </div>
                <span style={{ ...styles.badge, background: p.status === 'paid' ? '#d1fae5' : '#fef3c7', color: p.status === 'paid' ? '#065f46' : '#92400e' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const STATUS_BG = { pending: '#fef3c7', in_progress: '#dbeafe', resolved: '#d1fae5' };
const STATUS_COLOR = { pending: '#92400e', in_progress: '#1e40af', resolved: '#065f46' };

const styles = {
  page: { maxWidth: '900px' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    borderRadius: '12px',
    padding: '24px 28px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeTitle: { color: 'white', fontSize: '22px', fontWeight: '700', margin: 0 },
  welcomeSub: { color: '#bfdbfe', fontSize: '14px', marginTop: '4px' },
  roomBadge: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  statIcon: { fontSize: '28px' },
  statValue: { fontSize: '20px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  section: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 },
  viewAll: { fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  listTitle: { fontSize: '14px', fontWeight: '500', color: '#1e293b' },
  listSub: { fontSize: '13px', color: '#64748b' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  empty: { fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '12px 0' },
};

export default StudentDashboard;
