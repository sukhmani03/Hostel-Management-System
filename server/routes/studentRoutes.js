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
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All student routes require authentication
router.use(protect);

router.get('/', authorize('admin', 'warden'), getAllStudents);
router.get('/:id', getStudent);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.put('/:id/assign-room', authorize('admin'), assignRoom);
router.get('/:id/qr', generateQR);

module.exports = router;
