import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { studentService } from '../../services/api';

// ===== Warden Students Page (read-only) =====
const WardenStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentService.getAll(search);
      const payload = res.data?.data;
      const list = Array.isArray(payload) ? payload : (payload?.students || []);
      setStudents(list);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>🎓 Students</h2>
        <span style={{ color: '#64748b', fontSize: '13px' }}>
          {students.length} student{students.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search Bar */}
      <div className="card" style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍  Search by name, email or roll number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
          style={styles.searchInput}
        />
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" />
        ) : students.length === 0 ? (
          <div style={styles.empty}>No students found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No.</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{student.name}</span>
                      </div>
                    </td>
                    <td>{student.rollNumber || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{student.email}</td>
                    <td>{student.phone || '—'}</td>
                    <td>{student.course || '—'}</td>
                    <td>
                      {student.roomId
                        ? (typeof student.roomId === 'object'
                          ? `Room ${student.roomId.roomNumber}`
                          : `Room ${student.roomId}`)
                        : <span style={{ color: '#94a3b8' }}>Not assigned</span>}
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
    marginBottom: '16px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  searchBar: {
    marginBottom: '16px',
    padding: '10px 16px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    flexShrink: 0,
  },
};

export default WardenStudents;
