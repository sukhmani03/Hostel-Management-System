import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

// Create a configured axios instance with base URL pointing to our API proxy
const api = axios.create({
  baseURL: '/api',
});

// ===== Request Interceptor =====
// Attach the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
// If we get a 401 (Unauthorized), log the user out and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth Service =====
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),

  getMe: () =>
    api.get('/auth/me'),
};

// ===== Student Service =====
export const studentService = {
  getAll: (search = '') =>
    api.get('/students', { params: { search } }),

  getMe: () =>
    api.get('/students/me'),

  getById: (id) =>
    api.get(`/students/${id}`),

  create: (data) =>
    api.post('/students', data),

  update: (id, data) =>
    api.put(`/students/${id}`, data),

  remove: (id) =>
    api.delete(`/students/${id}`),

  assignRoom: (id, roomId) =>
    api.put(`/students/${id}/assign-room`, { roomId }),

  getQR: (id) =>
    api.get(`/students/${id}/qr`),
};

// ===== Room Service =====
export const roomService = {
  getAll: (filters = {}) =>
    api.get('/rooms', { params: filters }),

  getById: (id) =>
    api.get(`/rooms/${id}`),

  create: (data) =>
    api.post('/rooms', data),

  update: (id, data) =>
    api.put(`/rooms/${id}`, data),

  remove: (id) =>
    api.delete(`/rooms/${id}`),
};

// ===== Payment Service =====
export const paymentService = {
  getAll: () =>
    api.get('/payments'),

  getMy: () =>
    api.get('/payments/my'),

  create: (data) =>
    api.post('/payments', data),

  getHistory: (studentId) =>
    api.get(`/payments/history/${studentId}`),

  createOrder: (data) =>
    api.post('/payments/create-order', data),

  verifyPayment: (data) =>
    api.post('/payments/verify', data),
};

// ===== Complaint Service =====
export const complaintService = {
  getAll: (filters = {}) =>
    api.get('/complaints', { params: filters }),

  getMy: () =>
    api.get('/complaints/my'),

  getById: (id) =>
    api.get(`/complaints/${id}`),

  create: (data) =>
    api.post('/complaints', data),

  update: (id, data) =>
    api.put(`/complaints/${id}`, data),

  remove: (id) =>
    api.delete(`/complaints/${id}`),
};

// ===== Attendance Service =====
export const attendanceService = {
  mark: (data) =>
    api.post('/attendance', data),

  getMy: () =>
    api.get('/attendance/my'),

  getAll: (date) =>
    api.get('/attendance', { params: { date } }),

  getStudentHistory: (studentId) =>
    api.get(`/attendance/student/${studentId}`),
};

// ===== Dashboard Service =====
export const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getWardenStats: () =>
    api.get('/dashboard/warden-stats'),
};

export default api;
