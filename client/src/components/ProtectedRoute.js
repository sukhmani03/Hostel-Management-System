import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * If the user is not logged in, redirects to /login.
 * Optionally accepts an `allowedRoles` array to restrict by role.
 * Otherwise, renders child routes via <Outlet />.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to the appropriate dashboard if role doesn't match
      const role = user?.role;
      if (role === 'student') return <Navigate to="/student/dashboard" replace />;
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // If children are passed directly, render them; otherwise use Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
