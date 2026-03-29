import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { studentService } from '../../services/api';

const MyQRCode = () => {
  const [profile, setProfile]   = useState(null);
  const [qrCode, setQrCode]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getMe();
        setProfile(res.data?.data);
      } catch {
        toast.error('Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const loadQR = async () => {
    if (!profile?._id) return;
    setQrLoading(true);
    try {
      const res = await studentService.getQR(profile._id);
      setQrCode(res.data?.data?.qrCode);
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Auto-load QR once profile is available
  useEffect(() => {
    if (profile?._id) loadQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-${profile?.rollNumber || profile?.name || 'student'}.png`;
    link.click();
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  if (!profile) {
    return (
      <div style={styles.noProfile}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
        <p>Student profile not found. Please contact the admin.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My QR Code</h1>

      <div style={styles.layout}>
        {/* QR Code card */}
        <div style={styles.qrCard}>
          <p style={styles.qrHint}>Your unique QR code for attendance & verification</p>
          {qrLoading ? (
            <div style={styles.qrPlaceholder}>⏳ Generating QR code...</div>
          ) : qrCode ? (
            <img src={qrCode} alt="Student QR Code" style={styles.qrImage} />
          ) : (
            <div style={styles.qrPlaceholder}>📱 QR code unavailable</div>
          )}
          <div style={styles.qrActions}>
            <button style={styles.refreshBtn} onClick={loadQR} disabled={qrLoading}>
              🔄 Refresh
            </button>
            {qrCode && (
              <button style={styles.downloadBtn} onClick={handleDownload}>
                ⬇️ Download
              </button>
            )}
          </div>
        </div>

        {/* Student info card */}
        <div style={styles.infoCard}>
          <h2 style={styles.infoTitle}>Student Details</h2>
          <div style={styles.infoRows}>
            <InfoRow label="Name"        value={profile.name} />
            <InfoRow label="Roll Number" value={profile.rollNumber} />
            <InfoRow label="Email"       value={profile.email} />
            <InfoRow label="Course"      value={profile.course} />
            <InfoRow label="Room"        value={profile.roomId ? `Room ${profile.roomId.roomNumber}` : 'Not Assigned'} />
            <InfoRow label="Phone"       value={profile.phone} />
          </div>
          <div style={styles.qrNote}>
            <strong>📌 Usage:</strong> This QR code contains your student ID and details. It can be scanned by
            hostel staff for attendance marking or identity verification.
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value || '—'}</span>
  </div>
);

const styles = {
  page: { maxWidth: '900px' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  noProfile: { textAlign: 'center', padding: '60px 20px', color: '#64748b', background: 'white', borderRadius: '12px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  qrCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  qrHint: { fontSize: '13px', color: '#64748b', marginBottom: '20px' },
  qrImage: {
    width: '240px',
    height: '240px',
    border: '4px solid #f1f5f9',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'block',
    margin: '0 auto 20px',
  },
  qrPlaceholder: {
    width: '240px',
    height: '240px',
    background: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 auto 20px',
  },
  qrActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  refreshBtn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  downloadBtn: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  infoTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  infoRows: { marginBottom: '20px' },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 0',
    borderBottom: '1px solid #f8fafc',
  },
  infoLabel: { fontSize: '13px', color: '#64748b' },
  infoValue: { fontSize: '14px', fontWeight: '500', color: '#1e293b', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-word' },
  qrNote: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#0369a1',
    lineHeight: '1.6',
  },
};

export default MyQRCode;
