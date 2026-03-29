import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './modules/admin/Dashboard';
import StudentsPage from './modules/admin/Students';
import RoomsPage from './modules/admin/Rooms';
import PaymentsPage from './modules/admin/Payments';
import ComplaintsPage from './modules/admin/Complaints';
import AttendancePage from './modules/admin/Attendance';

import StudentDashboard from './modules/student/Dashboard';
import MyRoom from './modules/student/MyRoom';
import MyPayments from './modules/student/MyPayments';
import MyComplaints from './modules/student/MyComplaints';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Admin / Warden Routes - wrapped in AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'warden']}>
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

        {/* Protected Student Routes - wrapped in StudentLayout */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"  element={<StudentDashboard />} />
          <Route path="my-room"    element={<MyRoom />} />
          <Route path="payments"   element={<MyPayments />} />
          <Route path="complaints" element={<MyComplaints />} />
        </Route>

        {/* Fallback - redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

