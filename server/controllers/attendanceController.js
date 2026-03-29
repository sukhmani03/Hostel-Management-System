// Attendance controller - mark and retrieve student attendance records
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

/**
 * @desc    Mark attendance for a student
 * @route   POST /api/attendance
 * @access  Private (admin/warden)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;

    // Normalize date to midnight to avoid duplicate records for same day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance was already marked for this student on this date
    const existing = await Attendance.findOne({ studentId, date: attendanceDate });
    if (existing) {
      // Update existing record instead of creating a duplicate
      existing.status = status;
      existing.markedBy = req.user._id;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Attendance updated', data: existing });
    }

    const attendance = await Attendance.create({
      studentId,
      date: attendanceDate,
      status,
      markedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Attendance marked successfully', data: attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance for all students on a given date, or for a specific student
 * @route   GET /api/attendance
 * @access  Private
 */
const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;

    if (date) {
      // Match records for the entire day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'name email rollNumber')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full attendance history for a specific student
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId })
      .sort({ date: -1 });

    // Calculate attendance summary stats
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        records: attendance,
        summary: { total, present, absent, percentage },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance history for the currently logged-in student
 * @route   GET /api/attendance/my
 * @access  Private (student)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ studentId: student._id }).sort({ date: -1 });

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        records: attendance,
        summary: { total, present, absent, percentage },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, getAttendance, getStudentAttendanceHistory, getMyAttendance };
