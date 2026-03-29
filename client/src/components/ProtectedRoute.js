import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUser, clearAuth } from '../utils/auth';

// Map each role to its default dashboard path
const ROLE_HOME = {
  admin:   '/admin/dashboard',
  warden:  '/warden/dashboard',
  student: '/student/dashboard',
};

/**
 * ProtectedRoute - Wraps routes that require authentication and optionally a specific role.
 * - If the user is not logged in, redirects to /login.
 * - If `roles` is provided and the user's role is not in the list,
 *   redirects to the user's own dashboard (prevents cross-role access).
 *   If the role is unrecognized, clears the session and redirects to /login.
 * - Otherwise, renders child routes via <Outlet />.
 */
const ProtectedRoute = ({ children, roles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const user = getUser();
    const userRole = user?.role;
    if (!userRole || !roles.includes(userRole)) {
      const home = ROLE_HOME[userRole];
      if (!home) {
        // Unknown role — clear the invalid session and force re-login
        clearAuth();
        return <Navigate to="/login" replace />;
      }
      // Redirect to the user's own dashboard instead of showing an error
      return <Navigate to={home} replace />;
    }
  }

  // If children are passed directly, render them; otherwise use Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
