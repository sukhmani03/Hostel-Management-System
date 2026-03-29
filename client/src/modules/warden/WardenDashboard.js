import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import { getUser } from '../../utils/auth';

// ===== Fallback dummy data =====
const DUMMY = {
  complaints: { pending: 4, inProgress: 2, resolved: 18, total: 24 },
  rooms:      { available: 14, occupied: 38, maintenance: 3, total: 55 },
  totalStudents: 52,
  recentComplaints: [],
};

// ===== Status badge colours =====
const STATUS_COLORS = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  resolved:    { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
};

// ===== Small reusable stat card =====
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ ...cardStyle.card, borderLeft: `4px solid ${color}` }}>
    <div style={cardStyle.iconWrap}>
      <span style={{ fontSize: '26px' }}>{icon}</span>
    </div>
    <div>
      <div style={cardStyle.value}>{value}</div>
      <div style={cardStyle.label}>{label}</div>
      {sub && <div style={cardStyle.sub}>{sub}</div>}
    </div>
  </div>
);

const cardStyle = {
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  iconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value:  { fontSize: '22px', fontWeight: '700', color: '#1e293b', lineHeight: 1.2 },
  label:  { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  sub:    { fontSize: '12px', color: '#94a3b8', marginTop: '1px' },
};

// ===== Quick-action button =====
const QuickLink = ({ icon, label, to, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: color + '18',
        border: `1px solid ${color}40`,
        borderRadius: '8px',
        color,
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {label}
    </button>
  );
};

// ===== Badge component =====
const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      padding: '2px 9px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  );
};

// ===== Main Warden Dashboard =====
const WardenDashboard = () => {
  const user = getUser();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardService.getWardenStats();
      setData(res.data?.data || DUMMY);
    } catch {
      setData(DUMMY);
      toast.info('Using demo data — API not connected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" />
        <p style={{ color: '#64748b', marginTop: '8px' }}>Loading dashboard…</p>
      </div>
    );
  }

  const d = data || DUMMY;
  const c = d.complaints || DUMMY.complaints;
  const r = d.rooms      || DUMMY.rooms;

  const complaintChartData = [
    { name: 'Pending',     value: c.pending,    color: '#fbbc04' },
    { name: 'In Progress', value: c.inProgress,  color: '#1a73e8' },
    { name: 'Resolved',    value: c.resolved,    color: '#34a853' },
  ].filter(item => item.value > 0);

  const roomChartData = [
    { name: 'Available',   value: r.available,   color: '#34a853' },
    { name: 'Occupied',    value: r.occupied,     color: '#ea4335' },
    { name: 'Maintenance', value: r.maintenance,  color: '#fbbc04' },
  ].filter(item => item.value > 0);

  const barData = [
    { label: 'Pending',     count: c.pending },
    { label: 'In Progress', count: c.inProgress },
    { label: 'Resolved',    count: c.resolved },
  ];

  return (
    <div style={styles.page}>

      {/* ===== Welcome Banner ===== */}
      <div style={styles.banner}>
        <div>
          <h2 style={styles.bannerTitle}>👋 Welcome, {user?.name || 'Warden'}!</h2>
          <p style={styles.bannerSub}>Here's your hostel overview for today.</p>
        </div>
        <span style={styles.bannerBadge}>Warden Panel</span>
      </div>

      {/* ===== Top Stat Cards ===== */}
      <div style={styles.statsGrid}>
        <StatCard icon="⏳" label="Pending Complaints"   value={c.pending}       color="#fbbc04" sub="Awaiting action" />
        <StatCard icon="🔄" label="In Progress"          value={c.inProgress}    color="#1a73e8" sub="Being resolved" />
        <StatCard icon="✅" label="Resolved Complaints"  value={c.resolved}      color="#34a853" sub="Closed" />
        <StatCard icon="🎓" label="Total Students"       value={d.totalStudents} color="#8b5cf6" sub="Enrolled" />
      </div>

      {/* ===== Room Status Cards ===== */}
      <div style={styles.sectionTitle}>🏠 Room Status Overview</div>
      <div style={styles.roomGrid}>
        <StatCard icon="🟢" label="Available Rooms"   value={r.available}   color="#34a853" sub={`of ${r.total} total`} />
        <StatCard icon="🔴" label="Occupied Rooms"    value={r.occupied}    color="#ea4335" sub={`${r.total ? Math.round((r.occupied / r.total) * 100) : 0}% occupancy`} />
        <StatCard icon="🟡" label="Under Maintenance" value={r.maintenance} color="#fbbc04" sub="Temporarily unavailable" />
      </div>

      {/* ===== Charts Row ===== */}
      <div style={styles.chartsRow}>
        {/* Complaint status pie */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📋 Complaint Status Distribution</h3>
          {complaintChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={complaintChartData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value" labelLine={false}
                >
                  {complaintChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>No complaint data available.</div>
          )}
        </div>

        {/* Room status pie */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🛏️ Room Occupancy Status</h3>
          {roomChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roomChartData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value" labelLine={false}
                >
                  {roomChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>No room data available.</div>
          )}
        </div>

        {/* Complaint bar chart */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Recent Pending Complaints + Quick Actions ===== */}
      <div style={styles.bottomRow}>
        <div className="card" style={{ flex: 2, padding: 0, overflow: 'hidden' }}>
          <div style={styles.tableHeader}>
            <h3 style={styles.chartTitle}>⏳ Recent Pending &amp; In-Progress Complaints</h3>
          </div>
          {!d.recentComplaints || d.recentComplaints.length === 0 ? (
            <div style={styles.noData}>No open complaints. Great job! 🎉</div>
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
                  </tr>
                </thead>
                <tbody>
                  {d.recentComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td style={{ fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {complaint.title}
                      </td>
                      <td>{complaint.studentId?.name || '—'}</td>
                      <td>
                        {complaint.studentId?.roomId?.roomNumber
                          ? `Room ${complaint.studentId.roomId.roomNumber}`
                          : '—'}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{complaint.category || '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{complaint.priority || '—'}</td>
                      <td><Badge status={complaint.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <QuickLink icon="📋" label="Manage Complaints"  to="/warden/complaints" color="#1a73e8" />
            <QuickLink icon="🛏️"  label="Update Room Status" to="/warden/rooms"      color="#34a853" />
            <QuickLink icon="🎓" label="View Students"      to="/warden/students"   color="#8b5cf6" />
            <QuickLink icon="✅" label="Attendance"         to="/warden/attendance" color="#fbbc04" />
          </div>
        </div>
      </div>

    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  banner: {
    background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    borderRadius: '12px',
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
  },
  bannerSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.75)',
    marginTop: '4px',
    marginBottom: 0,
  },
  bannerBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px',
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '-8px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  chartCard: { },
  chartTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px',
  },
  noData: {
    padding: '36px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  bottomRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  tableHeader: {
    padding: '16px 20px 8px',
  },
};

export default WardenDashboard;
