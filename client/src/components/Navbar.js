import React from 'react';
import { getUser } from '../utils/auth';

/**
 * Navbar - Top navigation bar showing page title and current user info.
 * @param {string} title - The name of the current page
 */
const Navbar = ({ title }) => {
  const user = getUser();

  // Map roles to badge colors
  const roleBadgeColor = {
    admin:   { bg: '#dbeafe', color: '#1e40af' },
    warden:  { bg: '#d1fae5', color: '#065f46' },
    student: { bg: '#fef3c7', color: '#92400e' },
  };
  const badge = roleBadgeColor[user?.role] || roleBadgeColor.student;

  return (
    <header style={styles.navbar}>
      {/* Current page title */}
      <h1 style={styles.title}>{title || 'Dashboard'}</h1>

      {/* User info on the right */}
      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={styles.userDetails}>
          <span style={styles.userName}>{user?.name || 'User'}</span>
          <span
            style={{
              ...styles.roleBadge,
              background: badge.bg,
              color: badge.color,
            }}
          >
            {user?.role || 'guest'}
          </span>
        </div>
      </div>
    </header>
  );
};

const styles = {
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
    background: '#1a73e8',
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
};

export default Navbar;
