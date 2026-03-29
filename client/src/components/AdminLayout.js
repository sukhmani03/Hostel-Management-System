import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Map URL paths to human-readable page titles
const PAGE_TITLES = {
  '/admin/dashboard':          'Dashboard',
  '/admin/warden-dashboard':   'Warden Dashboard',
  '/admin/students':           'Students',
  '/admin/rooms':              'Rooms',
  '/admin/payments':           'Payments',
  '/admin/complaints':         'Complaints',
  '/admin/attendance':         'Attendance',
};

/**
 * AdminLayout - Wraps all admin pages with the Sidebar and Navbar.
 * Child routes are rendered via React Router's <Outlet />.
 */
const AdminLayout = () => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div style={styles.wrapper}>
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main content area, offset by sidebar width */}
      <div style={styles.main}>
        <Navbar title={pageTitle} />

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
  main: {
    marginLeft: '250px', // same as sidebar width
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

export default AdminLayout;
