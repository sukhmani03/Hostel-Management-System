// Attendance routes - mark and retrieve attendance records
const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getStudentAttendanceHistory, getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// IMPORTANT: specific routes before parameterized ones
router.get('/my', getMyAttendance);
// IMPORTANT: /student/:studentId must come before any parameterized route
router.get('/student/:studentId', getStudentAttendanceHistory);
router.post('/', markAttendance);
router.get('/', getAttendance);

module.exports = router;
