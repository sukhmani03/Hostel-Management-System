import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'react-toastify';
import { dashboardService } from '../../services/api';

// ===== Fallback dummy data (used when API is unavailable) =====
const DUMMY_STATS = {
  totalStudents: 124,
  totalRooms: 60,
  availableRooms: 14,
  monthlyRevenue: 186000,
  pendingComplaints: 5,
  presentToday: 110,
};

const DUMMY_REVENUE = [
  { month: 'Jan', revenue: 142000 },
  { month: 'Feb', revenue: 158000 },
  { month: 'Mar', revenue: 171000 },
  { month: 'Apr', revenue: 165000 },
  { month: 'May', revenue: 180000 },
  { month: 'Jun', revenue: 186000 },
];

const DUMMY_ROOM_STATUS = [
  { name: 'Occupied', value: 46, color: '#ea4335' },
  { name: 'Available', value: 14, color: '#34a853' },
  { name: 'Maintenance', value: 0, color: '#fbbc04' },
];

// ===== Stat Card Component =====
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ ...cardStyles.card, borderLeft: `4px solid ${color}` }}>
    <div style={cardStyles.iconWrap}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
    </div>
    <div>
      <div style={cardStyles.value}>{value}</div>
      <div style={cardStyles.label}>{label}</div>
      {sub && <div style={cardStyles.sub}>{sub}</div>}
    </div>
  </div>
);

const cardStyles = {
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#f8faff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1.2,
  },
  label: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  },
  sub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '1px',
  },
};

// ===== Main Dashboard Component =====
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(DUMMY_REVENUE);
  const [roomStatus, setRoomStatus] = useState(DUMMY_ROOM_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        const data = res.data;
        setStats(data.stats || DUMMY_STATS);
        if (data.revenueChart) setRevenueData(data.revenueChart);
        if (data.roomStatus) setRoomStatus(data.roomStatus);
      } catch {
        // Use dummy data if API is not available
        setStats(DUMMY_STATS);
        toast.info('Using demo data — API not connected');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" />
        <p style={{ color: '#64748b', marginTop: '8px' }}>Loading dashboard...</p>
      </div>
    );
  }

  const s = stats || DUMMY_STATS;

  return (
    <div style={styles.page}>
      {/* ===== Stat Cards ===== */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🎓"
          label="Total Students"
          value={s.totalStudents}
          color="#1a73e8"
          sub="Enrolled"
        />
        <StatCard
          icon="🛏️"
          label="Total Rooms"
          value={s.totalRooms}
          color="#34a853"
          sub={`${s.availableRooms} available`}
        />
        <StatCard
          icon="✅"
          label="Present Today"
          value={s.presentToday ?? '—'}
          color="#fbbc04"
          sub="Attendance"
        />
        <StatCard
          icon="💰"
          label="Monthly Revenue"
          value={`₹${(s.monthlyRevenue || 0).toLocaleString()}`}
          color="#ea4335"
          sub="This month"
        />
      </div>

      {/* ===== Charts Row ===== */}
      <div style={styles.chartsRow}>
        {/* Revenue Bar Chart */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Revenue — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1a73e8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Room Status Pie Chart */}
        <div className="card" style={styles.pieCard}>
          <h3 style={styles.chartTitle}>🏠 Room Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={roomStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {roomStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Quick Summary Cards ===== */}
      <div style={styles.summaryRow}>
        <div className="card" style={styles.summaryCard}>
          <h3 style={styles.chartTitle}>📋 Pending Complaints</h3>
          <div style={styles.bigNumber}>{s.pendingComplaints ?? 0}</div>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Awaiting review or resolution
          </p>
        </div>

        <div className="card" style={styles.summaryCard}>
          <h3 style={styles.chartTitle}>🛏️ Occupancy Rate</h3>
          <div style={styles.bigNumber}>
            {s.totalRooms
              ? `${Math.round(((s.totalRooms - s.availableRooms) / s.totalRooms) * 100)}%`
              : '—'}
          </div>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            {s.totalRooms - s.availableRooms} of {s.totalRooms} rooms occupied
          </p>
        </div>

        <div className="card" style={styles.summaryCard}>
          <h3 style={styles.chartTitle}>📅 Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <a href="/admin/students" style={styles.quickLink}>➕ Add New Student</a>
            <a href="/admin/rooms"    style={styles.quickLink}>🛏️ Manage Rooms</a>
            <a href="/admin/payments" style={styles.quickLink}>💳 Record Payment</a>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
  },
  chartCard: {
    flex: 1,
  },
  pieCard: {
    flex: 1,
  },
  chartTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  summaryCard: {
    textAlign: 'center',
  },
  bigNumber: {
    fontSize: '40px',
    fontWeight: '700',
    color: '#1a73e8',
    margin: '8px 0',
  },
  quickLink: {
    display: 'block',
    padding: '8px 12px',
    background: '#f0f7ff',
    borderRadius: '6px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
  },
};

export default Dashboard;
