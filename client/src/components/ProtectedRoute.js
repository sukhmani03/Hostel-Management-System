import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * If the user is not logged in, redirects to /login.
 * Otherwise, renders child routes via <Outlet />.
 */
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  // If children are passed directly, render them; otherwise use Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
