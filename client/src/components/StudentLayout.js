import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';

// Navigation items for the student sidebar
const NAV_ITEMS = [
  { path: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/student/my-room',   icon: '🛏️',  label: 'My Room' },
  { path: '/student/payments',  icon: '💳', label: 'Fees & Payments' },
  { path: '/student/complaints',icon: '📋', label: 'Complaints' },
];

// Map URL paths to human-readable page titles
const PAGE_TITLES = {
  '/student/dashboard':  'My Dashboard',
  '/student/my-room':    'My Room',
  '/student/payments':   'Fees & Payments',
  '/student/complaints': 'Complaints',
};

/**
 * StudentLayout - Wraps all student pages with a Sidebar and Navbar.
 * Child routes are rendered via React Router's <Outlet />.
 */
const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Student Portal';

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Map roles to badge colors
  const roleBadgeStyle = { bg: '#fef3c7', color: '#92400e' };

  return (
    <div style={styles.wrapper}>
      {/* Fixed left sidebar */}
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

      {/* Main content area */}
      <div style={styles.main}>
        {/* Navbar */}
        <header style={styles.navbar}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.name || 'Student'}</span>
              <span style={{ ...styles.roleBadge, background: roleBadgeStyle.bg, color: roleBadgeStyle.color }}>
                student
              </span>
            </div>
          </div>
        </header>

        {/* Page content rendered here */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
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
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandIcon: { fontSize: '28px' },
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
    background: 'rgba(234,179,8,0.15)',
    color: '#fbbf24',
    borderLeft: '3px solid #f59e0b',
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
  },
  main: {
    marginLeft: '250px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  navbar: {
    background: 'white',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#f59e0b',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '1px 8px',
    borderRadius: '999px',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
};

export default StudentLayout;
