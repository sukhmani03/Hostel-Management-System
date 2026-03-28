import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';

// Navigation items for the student portal
const STUDENT_NAV_ITEMS = [
  { path: '/student/dashboard',  icon: '🏠', label: 'Dashboard' },
  { path: '/student/my-room',    icon: '🛏️',  label: 'My Room' },
  { path: '/student/my-fees',    icon: '💳', label: 'My Fees' },
  { path: '/student/complaints', icon: '📋', label: 'Complaints' },
  { path: '/student/qr-code',    icon: '📱', label: 'My QR Code' },
  { path: '/student/attendance', icon: '✅', label: 'My Attendance' },
];

const StudentLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🏠</span>
          <span style={styles.brandText}>HostelMS</span>
        </div>

        {/* Role label */}
        <div style={styles.roleLabel}>Student Portal</div>

        {/* User info */}
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={styles.nav}>
          {STUDENT_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={styles.bottom}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f1f5f9',
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '24px 20px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandIcon: {
    fontSize: '28px',
  },
  brandText: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  roleLabel: {
    padding: '8px 20px 8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    flexShrink: 0,
  },
  userName: {
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: '600',
  },
  userEmail: {
    color: '#64748b',
    fontSize: '11px',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    padding: '12px 0',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.15s, color 0.15s',
    borderLeft: '3px solid transparent',
    margin: '2px 0',
  },
  navLinkActive: {
    background: 'rgba(59,130,246,0.15)',
    color: '#93c5fd',
    borderLeft: '3px solid #3b82f6',
  },
  navIcon: {
    fontSize: '18px',
    width: '22px',
    textAlign: 'center',
  },
  bottom: {
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 16px',
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.15s',
  },
  main: {
    marginLeft: '250px',
    flex: 1,
    padding: '24px',
    minHeight: '100vh',
  },
};

export default StudentLayout;
