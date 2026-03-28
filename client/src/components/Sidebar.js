import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';

// Navigation items for the admin sidebar
const NAV_ITEMS = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/students',  icon: '🎓', label: 'Students' },
  { path: '/admin/rooms',     icon: '🛏️',  label: 'Rooms' },
  { path: '/admin/payments',  icon: '💳', label: 'Payments' },
  { path: '/admin/complaints',icon: '📋', label: 'Complaints' },
  { path: '/admin/attendance',icon: '✅', label: 'Attendance' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      {/* Brand / Logo */}
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🏠</span>
        <span style={styles.brandText}>HostelMS</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
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

      {/* Logout Button at Bottom */}
      <div style={styles.bottom}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
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
    padding: '24px 20px',
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
};

export default Sidebar;
