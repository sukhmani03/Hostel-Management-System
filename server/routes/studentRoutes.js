// Student routes - CRUD, room assignment, and QR code generation
const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  assignRoom,
  generateQR,
  getMyProfile,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All student routes require authentication
router.use(protect);

// IMPORTANT: /me must come before /:id to avoid being matched as a student ID
router.get('/me', getMyProfile);
router.get('/', authorize('admin', 'warden'), getAllStudents);
router.get('/:id', getStudent);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.put('/:id/assign-room', authorize('admin'), assignRoom);
router.get('/:id/qr', generateQR);

module.exports = router;
