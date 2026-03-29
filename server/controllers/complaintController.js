// Complaint controller - manage student complaints and their resolution
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');

/**
 * @desc    Get all complaints with optional filters
 * @route   GET /api/complaints
 * @access  Private
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { studentId, status, category, priority } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate({
        path: 'studentId',
        select: 'name email rollNumber roomId',
        populate: { path: 'roomId', select: 'roomNumber' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('studentId', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private
 */
const createComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status or add admin note (admin/warden only)
 * @route   PUT /api/complaints/:id
 * @access  Private (admin/warden)
 */
const updateComplaint = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Set resolvedAt timestamp when complaint is marked as resolved
    if (updateData.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a complaint
 * @route   DELETE /api/complaints/:id
 * @access  Private
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complaints submitted by the currently logged-in student
 * @route   GET /api/complaints/my
 * @access  Private (student)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllComplaints, getComplaint, createComplaint, updateComplaint, deleteComplaint, getMyComplaints };
