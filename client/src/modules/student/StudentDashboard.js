import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService, complaintService, paymentService, attendanceService } from '../../services/api';

// ===== Stat Card (clickable) =====
const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={{ ...styles.statIconWrap, background: color + '18' }}>
        <span style={styles.statIcon}>{icon}</span>
      </div>
      <div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  </Link>
);

// ===== Quick Action Button =====
const QuickAction = ({ icon, label, desc, to, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{ ...styles.quickAction, borderTop: `3px solid ${color}` }}
    >
      <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>{icon}</span>
      <span style={{ ...styles.quickActionLabel, color }}>{label}</span>
      <span style={styles.quickActionDesc}>{desc}</span>
    </button>
  );
};

// ===== Profile Info Row =====
const ProfileRow = ({ label, value }) => (
  <div style={styles.profileRow}>
    <span style={styles.profileRowLabel}>{label}</span>
    <span style={styles.profileRowValue}>{value || '—'}</span>
  </div>
);

// ===== Status styles =====
const STATUS_BG    = { pending: '#fef3c7', in_progress: '#dbeafe', resolved: '#d1fae5' };
const STATUS_COLOR = { pending: '#92400e', in_progress: '#1e40af', resolved: '#065f46' };
const PRIORITY_BG  = { low: '#f0fdf4', medium: '#fefce8', high: '#fff1f2' };
const PRIORITY_CLR = { low: '#166534', medium: '#854d0e', high: '#9f1239' };

// ===== Main Dashboard =====
const StudentDashboard = () => {
  const [profile, setProfile]     = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments]   = useState([]);
  const [attendance, setAttendance] = useState({ summary: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [loading, setLoading]     = useState(true);

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
        if (attRes.status === 'fulfilled')
          setAttendance(attRes.value.data?.data || { summary: { total: 0, present: 0, absent: 0, percentage: 0 } });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner" />
        <p style={{ color: '#64748b', marginTop: '10px' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const pendingComplaints = complaints.filter((c) => c.status === 'pending').length;
  const pendingPayments   = payments.filter((p) => p.status === 'pending').length;
  const attSummary        = attendance?.summary || { total: 0, present: 0, absent: 0, percentage: 0 };
  const attendancePct     = parseFloat(attSummary.percentage) || 0;
  const attColor          = attendancePct >= 75 ? '#10b981' : attendancePct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={styles.page}>

      {/* ===== Welcome Banner ===== */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {profile?.name || 'Student'}! 👋
          </h1>
          <p style={styles.welcomeSub}>
            {profile?.course || 'Hostel Management System'}
            {profile?.rollNumber ? ` · Roll No: ${profile.rollNumber}` : ''}
          </p>
        </div>
        <div style={styles.bannerRight}>
          <span style={styles.roleBadge}>🎓 Student</span>
          <span style={styles.roomBadge}>
            {profile?.roomId ? `🛏️ Room ${profile.roomId.roomNumber}` : '⚠️ No room assigned'}
          </span>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🛏️"
          label="My Room"
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
          color={attColor}
          to="/student/attendance"
        />
      </div>

      {/* ===== Profile + Attendance Row ===== */}
      <div style={styles.midRow}>
        {/* Profile card */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={styles.profileName}>{profile?.name || '—'}</div>
              <div style={styles.profileEmail}>{profile?.email || '—'}</div>
            </div>
          </div>
          <div style={styles.profileRows}>
            <ProfileRow label="Roll No."      value={profile?.rollNumber} />
            <ProfileRow label="Course"        value={profile?.course} />
            <ProfileRow label="Phone"         value={profile?.phone} />
            <ProfileRow label="Room"          value={profile?.roomId ? `Room ${profile.roomId.roomNumber}` : 'Not Assigned'} />
            <ProfileRow
              label="Admitted"
              value={profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : undefined}
            />
          </div>
        </div>

        {/* Attendance summary card */}
        <div style={styles.attCard}>
          <h3 style={styles.cardTitle}>📅 Attendance Overview</h3>
          <div style={styles.attStats}>
            <div style={styles.attStat}>
              <div style={{ ...styles.attStatValue, color: '#3b82f6' }}>{attSummary.total}</div>
              <div style={styles.attStatLabel}>Total Days</div>
            </div>
            <div style={styles.attStat}>
              <div style={{ ...styles.attStatValue, color: '#10b981' }}>{attSummary.present}</div>
              <div style={styles.attStatLabel}>Present</div>
            </div>
            <div style={styles.attStat}>
              <div style={{ ...styles.attStatValue, color: '#ef4444' }}>{attSummary.absent}</div>
              <div style={styles.attStatLabel}>Absent</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={styles.attProgressHeader}>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Attendance Rate</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: attColor }}>{attendancePct}%</span>
            </div>
            <div style={styles.attProgressTrack}>
              <div style={{ ...styles.attProgressBar, width: `${Math.min(attendancePct, 100)}%`, background: attColor }} />
            </div>
            {attendancePct < 75 && attSummary.total > 0 && (
              <p style={styles.attWarning}>⚠️ Below 75% — please attend regularly!</p>
            )}
            {attendancePct >= 75 && attSummary.total > 0 && (
              <p style={styles.attGood}>✅ Great attendance! Keep it up.</p>
            )}
            {attSummary.total === 0 && (
              <p style={styles.attNone}>No attendance records yet.</p>
            )}
          </div>
          <Link to="/student/attendance" style={styles.viewAllLink}>View full attendance →</Link>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div style={styles.quickGrid}>
          <QuickAction
            icon="📋"
            label="Raise Complaint"
            desc="Report a maintenance or hostel issue"
            to="/student/complaints"
            color="#3b82f6"
          />
          <QuickAction
            icon="💳"
            label="Pay Fees"
            desc="View and pay your hostel fees"
            to="/student/my-fees"
            color="#10b981"
          />
          <QuickAction
            icon="🛏️"
            label="My Room"
            desc="View your room details and facilities"
            to="/student/my-room"
            color="#8b5cf6"
          />
          <QuickAction
            icon="📱"
            label="My QR Code"
            desc="Download your student QR code"
            to="/student/qr-code"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* ===== Recent Complaints + Recent Payments Row ===== */}
      <div style={styles.bottomRow}>
        {/* Recent complaints */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 Recent Complaints</h2>
            <Link to="/student/complaints" style={styles.viewAllLink}>View All →</Link>
          </div>
          {complaints.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '32px' }}>📋</span>
              <p style={styles.emptyText}>No complaints yet.</p>
              <Link to="/student/complaints" style={styles.emptyAction}>Raise a complaint</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {complaints.slice(0, 4).map((c) => (
                <div key={c._id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <span style={styles.listTitle}>{c.title}</span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={styles.listSub}>{c.category}</span>
                      {c.priority && (
                        <span style={{ ...styles.badge, background: PRIORITY_BG[c.priority], color: PRIORITY_CLR[c.priority] }}>
                          {c.priority}
                        </span>
                      )}
                    </div>
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
            <h2 style={styles.sectionTitle}>💳 Recent Payments</h2>
            <Link to="/student/my-fees" style={styles.viewAllLink}>View All →</Link>
          </div>
          {payments.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '32px' }}>💳</span>
              <p style={styles.emptyText}>No payment records found.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {payments.slice(0, 4).map((p) => (
                <div key={p._id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <span style={styles.listTitle}>₹{(p.amount ?? 0).toLocaleString()} — {p.month}</span>
                    <span style={styles.listSub}>
                      {p.paymentDate
                        ? `Paid on ${new Date(p.paymentDate).toLocaleDateString()}`
                        : p.description || 'Hostel fee'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ ...styles.badge, background: p.status === 'paid' ? '#d1fae5' : '#fef3c7', color: p.status === 'paid' ? '#065f46' : '#92400e' }}>
                      {p.status}
                    </span>
                    {p.status === 'paid' && (
                      <Link to="/student/my-fees" style={styles.receiptLink}>
                        🧾 Receipt
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const styles = {
  page: { maxWidth: '1000px' },
  loading: { padding: '60px', textAlign: 'center' },

  // Welcome banner
  welcomeBanner: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    borderRadius: '14px',
    padding: '26px 30px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  welcomeTitle: { color: 'white', fontSize: '22px', fontWeight: '700', margin: 0 },
  welcomeSub: { color: '#bfdbfe', fontSize: '14px', marginTop: '5px', marginBottom: 0 },
  bannerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  roleBadge: {
    background: 'rgba(255,255,255,0.25)',
    color: 'white',
    padding: '4px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  roomBadge: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
  },

  // Stat cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  statIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIcon: { fontSize: '22px' },
  statValue: { fontSize: '20px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '2px' },

  // Mid row
  midRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },

  // Profile card
  profileCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '18px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  profileAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileName: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  profileEmail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  profileRows: {},
  profileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f8fafc',
    fontSize: '13px',
  },
  profileRowLabel: { color: '#64748b' },
  profileRowValue: { color: '#1e293b', fontWeight: '500', textAlign: 'right', maxWidth: '65%', wordBreak: 'break-word' },

  // Attendance card
  attCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  attStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    textAlign: 'center',
  },
  attStat: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px 8px',
  },
  attStatValue: { fontSize: '22px', fontWeight: '700' },
  attStatLabel: { fontSize: '11px', color: '#64748b', marginTop: '3px' },
  attProgressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  attProgressTrack: { height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' },
  attProgressBar: { height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' },
  attWarning: { fontSize: '12px', color: '#d97706', marginTop: '8px', marginBottom: 0 },
  attGood: { fontSize: '12px', color: '#059669', marginTop: '8px', marginBottom: 0 },
  attNone: { fontSize: '12px', color: '#94a3b8', marginTop: '8px', marginBottom: 0 },

  // Quick actions
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px',
    marginTop: '14px',
  },
  quickAction: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px 16px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'box-shadow 0.15s, transform 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  quickActionLabel: { display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '4px' },
  quickActionDesc: { fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.4' },

  // Bottom row
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },

  // Shared section card
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    marginBottom: '0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 },
  viewAllLink: { fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },

  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: '8px',
    gap: '10px',
  },
  listItemLeft: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 },
  listTitle: { fontSize: '13px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  listSub: { fontSize: '11px', color: '#64748b', textTransform: 'capitalize' },
  badge: {
    padding: '3px 9px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  receiptLink: {
    fontSize: '11px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },

  emptyState: { textAlign: 'center', padding: '24px 10px', color: '#94a3b8' },
  emptyText: { margin: '8px 0 6px', fontSize: '13px' },
  emptyAction: { fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' },
};

export default StudentDashboard;
