// Main entry point for the Hostel Management System backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import global error handler
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Rate Limiting ---
// Stricter limit for auth routes (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit for all other routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // max 200 requests per window per IP
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Middleware ---
// Allow all origins for development (configure properly for production)
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/students', apiLimiter, studentRoutes);
app.use('/api/rooms', apiLimiter, roomRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/complaints', apiLimiter, complaintRoutes);
app.use('/api/attendance', apiLimiter, attendanceRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Hostel Management API is running' });
});

// --- Global Error Handler (must be last middleware) ---
app.use(errorHandler);

// --- Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
