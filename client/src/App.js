import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import WardenLayout from './components/WardenLayout';
import StudentLayout from './components/StudentLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './modules/admin/Dashboard';
import StudentsPage from './modules/admin/Students';
import RoomsPage from './modules/admin/Rooms';
import PaymentsPage from './modules/admin/Payments';
import ComplaintsPage from './modules/admin/Complaints';
import AttendancePage from './modules/admin/Attendance';

import WardenDashboard from './modules/warden/WardenDashboard';
import WardenRooms from './modules/warden/WardenRooms';
import WardenStudents from './modules/warden/WardenStudents';
import WardenAttendance from './modules/warden/WardenAttendance';

import StudentDashboard from './modules/student/StudentDashboard';
import MyRoom from './modules/student/MyRoom';
import MyFees from './modules/student/MyFees';
import MyComplaints from './modules/student/MyComplaints';
import MyQRCode from './modules/student/MyQRCode';
import MyAttendance from './modules/student/MyAttendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
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

        {/* Protected Warden Routes - admin can also access for supervision */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute roles={['warden', 'admin']}>
              <WardenLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"  element={<WardenDashboard />} />
          <Route path="rooms"      element={<WardenRooms />} />
          <Route path="students"   element={<WardenStudents />} />
          <Route path="attendance" element={<WardenAttendance />} />
        </Route>

        {/* Protected Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"  element={<StudentDashboard />} />
          <Route path="my-room"    element={<MyRoom />} />
          <Route path="my-fees"    element={<MyFees />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="qr-code"    element={<MyQRCode />} />
          <Route path="attendance" element={<MyAttendance />} />
        </Route>

        {/* Fallback - redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

