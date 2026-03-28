import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../services/api';

const STATUS_STYLES = {
  present: { bg: '#d1fae5', color: '#065f46', icon: '✅' },
  absent:  { bg: '#fee2e2', color: '#991b1b', icon: '❌' },
};

const MyAttendance = () => {
  const [data, setData]     = useState({ records: [], summary: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await attendanceService.getMy();
        setData(res.data?.data || { records: [], summary: { total: 0, present: 0, absent: 0, percentage: 0 } });
      } catch {
        toast.error('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div style={styles.loading}>Loading attendance...</div>;

  const { records, summary } = data;
  const pct = parseFloat(summary.percentage);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Attendance</h1>

      {/* Summary cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
          <div style={styles.statValue}>{summary.total}</div>
          <div style={styles.statLabel}>Total Days</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.statValue}>{summary.present}</div>
          <div style={styles.statLabel}>Present</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #ef4444' }}>
          <div style={styles.statValue}>{summary.absent}</div>
          <div style={styles.statLabel}>Absent</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ ...styles.statValue, color: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>
            {summary.percentage}%
          </div>
          <div style={styles.statLabel}>Attendance %</div>
        </div>
      </div>

      {/* Attendance progress bar */}
      {summary.total > 0 && (
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Attendance Rate</span>
            <span style={{ color: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626', fontWeight: '600' }}>
              {summary.percentage}%
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${Math.min(pct, 100)}%`, background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
          </div>
          {pct < 75 && (
            <p style={styles.progressWarning}>⚠️ Your attendance is below 75%. Please attend regularly.</p>
          )}
        </div>
      )}

      {/* Attendance records */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Attendance History</h2>
        {records.length === 0 ? (
          <p style={styles.empty}>No attendance records found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Date', 'Day', 'Status'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const date = new Date(r.date);
                  const s = STATUS_STYLES[r.status] || {};
                  return (
                    <tr key={r._id} style={styles.tr}>
                      <td style={styles.td}>{date.toLocaleDateString()}</td>
                      <td style={styles.td}>{date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                          {s.icon} {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' },
  statCard: { background: 'white', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  progressCard: { background: 'white', borderRadius: '10px', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' },
  progressLabel: { color: '#374151', fontWeight: '500' },
  progressTrack: { height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' },
  progressWarning: { fontSize: '13px', color: '#d97706', marginTop: '8px' },
  card: { background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '14px' },
  empty: { textAlign: 'center', color: '#64748b', padding: '20px 0' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px', fontSize: '14px', color: '#374151' },
  badge: { padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
};

export default MyAttendance;
