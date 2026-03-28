import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { studentService, roomService } from '../../services/api';

// ===== Empty form template =====
const EMPTY_FORM = {
  name: '', email: '', course: '', admissionDate: '',
  parentContact: '', phone: '', rollNumber: '', roomId: '',
};

// ===== Students Management Page =====
const StudentsPage = () => {
  const [students, setStudents]     = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [showQR, setShowQR]         = useState(null);   // student object for QR modal
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  // ===== Fetch students and rooms =====
  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentService.getAll(search);
      // Backend returns { success, data: { students: [...] } } or { success, data: [...] }
      const payload = res.data?.data;
      const list = Array.isArray(payload) ? payload : (payload?.students || []);
      setStudents(list);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await roomService.getAll();
      setRooms(res.data?.rooms || res.data || []);
    } catch {
      // Rooms are optional for display
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, [fetchStudents, fetchRooms]);

  // ===== Open Add / Edit modal =====
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (student) => {
    setForm({
      name:           student.name         || '',
      email:          student.email        || '',
      course:         student.course       || '',
      admissionDate:  student.admissionDate ? student.admissionDate.slice(0, 10) : '',
      parentContact:  student.parentContact || '',
      phone:          student.phone        || '',
      rollNumber:     student.rollNumber   || '',
      roomId:         student.roomId ? (typeof student.roomId === 'object' ? student.roomId._id : student.roomId) : '',
    });
    setEditId(student._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  // ===== Save (create or update) =====
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await studentService.update(editId, form);
        toast.success('Student updated!');
      } else {
        await studentService.create(form);
        toast.success('Student added!');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.remove(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  // ===== Filtered students list =====
  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // ===== Render =====
  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>🎓 Students</h2>
        <button className="btn btn-primary" onClick={openAdd}>
          ➕ Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍  Search by name, email, or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '12px' }}>
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>No students found. Add one to get started!</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Admission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontWeight: 600, color: '#1a73e8' }}>
                      {student.rollNumber || '—'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {student.parentContact && `Parent: ${student.parentContact}`}
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.course || '—'}</td>
                    <td>
                      {student.room
                        ? <span className="badge badge-info">
                            {student.room.roomNumber || student.room}
                          </span>
                        : <span className="badge badge-gray">Unassigned</span>}
                    </td>
                    <td>{student.phone || '—'}</td>
                    <td>
                      {student.admissionDate
                        ? new Date(student.admissionDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openEdit(student)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(student._id)}
                        >
                          🗑️
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setShowQR(student)}
                          title="View QR Code"
                        >
                          📱
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Add / Edit Modal ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={styles.formGrid}>
                <FormField label="Full Name *" value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })} placeholder="John Doe" />
                <FormField label="Email *" type="email" value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })} placeholder="john@email.com" />
                <FormField label="Roll Number" value={form.rollNumber}
                  onChange={(v) => setForm({ ...form, rollNumber: v })} placeholder="2024CS001" />
                <FormField label="Course" value={form.course}
                  onChange={(v) => setForm({ ...form, course: v })} placeholder="B.Tech CSE" />
                <FormField label="Phone" type="tel" value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })} placeholder="9876543210" />
                <FormField label="Parent Contact" type="tel" value={form.parentContact}
                  onChange={(v) => setForm({ ...form, parentContact: v })} placeholder="9876543210" />
                <FormField label="Admission Date" type="date" value={form.admissionDate}
                  onChange={(v) => setForm({ ...form, admissionDate: v })} />

                {/* Room assignment dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label>Assign Room</label>
                  <select
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  >
                    <option value="">— No Room —</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        Room {r.roomNumber} ({r.type}, Floor {r.floor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== QR Code Modal ===== */}
      {showQR && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '340px', textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Student QR Code</h2>
              <button className="modal-close" onClick={() => setShowQR(null)}>✕</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              {showQR.name} — {showQR.rollNumber || 'N/A'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <QRCodeSVG
                value={JSON.stringify({
                  id: showQR._id,
                  name: showQR.name,
                  email: showQR.email,
                  roll: showQR.rollNumber,
                })}
                size={200}
                level="H"
              />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
              Scan to view student details
            </p>
            <button
              className="btn btn-outline"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => setShowQR(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Reusable form field component =====
const FormField = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
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
  searchBar: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
};

export default StudentsPage;
