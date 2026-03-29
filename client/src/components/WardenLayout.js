import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import Navbar from './Navbar';

// Navigation items for the warden portal
const WARDEN_NAV_ITEMS = [
  { path: '/warden/dashboard',   icon: '📊', label: 'Dashboard' },
  { path: '/warden/complaints',  icon: '📋', label: 'Complaints' },
  { path: '/warden/rooms',       icon: '🛏️',  label: 'Room Status' },
  { path: '/warden/students',    icon: '🎓', label: 'Students' },
  { path: '/warden/attendance',  icon: '✅', label: 'Attendance' },
];

// Map URL paths to human-readable page titles
const PAGE_TITLES = {
  '/warden/dashboard':  'Warden Dashboard',
  '/warden/complaints': 'Complaints',
  '/warden/rooms':      'Room Status',
  '/warden/students':   'Students',
  '/warden/attendance': 'Attendance',
};

const WardenLayout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const pageTitle = PAGE_TITLES[window.location.pathname] || 'Warden Panel';

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
        <div style={styles.roleLabel}>Warden Panel</div>

        {/* User info */}
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={styles.nav}>
          {WARDEN_NAV_ITEMS.map((item) => (
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

      {/* Main content area */}
      <div style={styles.main}>
        <Navbar title={pageTitle} />
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
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
    color: '#34d399',
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
    background: 'linear-gradient(135deg, #10b981, #059669)',
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
    background: 'rgba(16,185,129,0.15)',
    color: '#6ee7b7',
    borderLeft: '3px solid #10b981',
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
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
};

export default WardenLayout;
