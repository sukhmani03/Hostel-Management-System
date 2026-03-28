import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './modules/admin/Dashboard';
import StudentsPage from './modules/admin/Students';
import RoomsPage from './modules/admin/Rooms';
import PaymentsPage from './modules/admin/Payments';
import ComplaintsPage from './modules/admin/Complaints';
import AttendancePage from './modules/admin/Attendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Admin Routes - wrapped in AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="students"   element={<StudentsPage />} />
          <Route path="rooms"      element={<RoomsPage />} />
          <Route path="payments"   element={<PaymentsPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>

        {/* Fallback - redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
