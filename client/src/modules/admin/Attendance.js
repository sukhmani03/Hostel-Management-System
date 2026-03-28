import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { attendanceService, studentService } from '../../services/api';

// ===== Attendance Page =====
const AttendancePage = () => {
  const [students, setStudents]           = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'present'|'absent' }
  const [history, setHistory]             = useState([]);
  const [date, setDate]                   = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading]             = useState(true);
  const [histLoading, setHistLoading]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);

  // ===== Load students =====
  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentService.getAll();
      const list = res.data?.students || res.data || [];
      setStudents(list);
      // Default all to 'present'
      const map = {};
      list.forEach((s) => { map[s._id] = 'present'; });
      setAttendanceMap(map);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== Load attendance history for selected date =====
  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await attendanceService.getAll(date);
      setHistory(res.data?.attendance || res.data || []);
    } catch {
      // History may not exist yet
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ===== Toggle individual student =====
  const toggleStatus = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  // ===== Mark all present / all absent =====
  const markAll = (status) => {
    const map = {};
    students.forEach((s) => { map[s._id] = status; });
    setAttendanceMap(map);
  };

  // ===== Submit attendance =====
  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.warning('No students to mark attendance for');
      return;
    }
    setSubmitting(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendanceMap[s._id] || 'absent',
        date,
      }));
      await attendanceService.mark({ date, records });
      toast.success(`Attendance saved for ${date}`);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Counters =====
  const presentCount = Object.values(attendanceMap).filter((v) => v === 'present').length;
  const absentCount  = students.length - presentCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>✅ Attendance</h2>
      </div>

      {/* Date Picker + Summary */}
      <div className="card">
        <div style={styles.topBar}>
          <div style={styles.datePicker}>
            <label style={{ fontWeight: 600, marginRight: '10px' }}>📅 Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px' }}
            />
          </div>

          {/* Summary */}
          <div style={styles.summaryBadges}>
            <span style={{ ...styles.pill, background: '#d1fae5', color: '#065f46' }}>
              ✅ Present: {presentCount}
            </span>
            <span style={{ ...styles.pill, background: '#fee2e2', color: '#991b1b' }}>
              ❌ Absent: {absentCount}
            </span>
            <span style={{ ...styles.pill, background: '#dbeafe', color: '#1e40af' }}>
              👥 Total: {students.length}
            </span>
          </div>
        </div>
      </div>

      {/* Mark Attendance Section */}
      <div className="card">
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Mark Attendance</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => markAll('present')}>
              ✅ All Present
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => markAll('absent')}>
              ❌ All Absent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : students.length === 0 ? (
          <p style={styles.empty}>No students found. Add students first.</p>
        ) : (
          <>
            <div style={styles.studentGrid}>
              {students.map((student) => {
                const isPresent = attendanceMap[student._id] === 'present';
                return (
                  <div
                    key={student._id}
                    onClick={() => toggleStatus(student._id)}
                    style={{
                      ...styles.studentCard,
                      background: isPresent ? '#f0fdf4' : '#fff1f2',
                      borderColor: isPresent ? '#34a853' : '#ea4335',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        ...styles.avatar,
                        background: isPresent ? '#34a853' : '#ea4335',
                      }}
                    >
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.studentName}>{student.name}</div>
                      <div style={styles.studentMeta}>
                        {student.rollNumber || student.email}
                      </div>
                    </div>

                    {/* Toggle */}
                    <div
                      style={{
                        ...styles.toggle,
                        background: isPresent ? '#34a853' : '#ea4335',
                      }}
                    >
                      {isPresent ? '✅' : '❌'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '10px 28px', fontSize: '15px' }}
              >
                {submitting ? 'Saving...' : `💾 Save Attendance for ${date}`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===== Attendance History Table ===== */}
      <div className="card">
        <h3 style={styles.sectionTitle}>📅 History for {date}</h3>

        {histLoading ? (
          <div className="spinner" />
        ) : history.length === 0 ? (
          <p style={styles.empty}>No attendance records for this date.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, idx) => (
                  <tr key={record._id || idx}>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      {record.student?.name || record.studentName || '—'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {record.student?.rollNumber || '—'}
                    </td>
                    <td>
                      {record.status === 'present' ? (
                        <span className="badge badge-success">Present</span>
                      ) : (
                        <span className="badge badge-danger">Absent</span>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  datePicker: {
    display: 'flex',
    alignItems: 'center',
  },
  summaryBadges: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '5px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '10px',
  },
  studentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    border: '2px solid',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    flexShrink: 0,
  },
  studentName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  studentMeta: {
    fontSize: '12px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toggle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '24px',
  },
};

export default AttendancePage;
