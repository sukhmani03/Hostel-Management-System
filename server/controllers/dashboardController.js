// Dashboard controller - provides summary statistics for the admin dashboard
const Student = require('../models/Student');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/dashboard/stats
 * @access  Private (admin/warden)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all queries in parallel for efficiency
    const [
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      pendingComplaints,
      recentPayments,
    ] = await Promise.all([
      Student.countDocuments(),
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'available' }),
      Complaint.countDocuments({ status: 'pending' }),
      Payment.find({ status: 'paid' })
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate('studentId', 'name email'),
    ]);

    // Calculate monthly revenue (sum of paid payments in the current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalRooms,
        occupiedRooms,
        availableRooms,
        monthlyRevenue,
        pendingComplaints,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get warden-specific dashboard statistics
 * @route   GET /api/dashboard/warden-stats
 * @access  Private (warden)
 */
const getWardenStats = async (req, res, next) => {
  try {
    const [
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalStudents,
    ] = await Promise.all([
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'maintenance' }),
      Student.countDocuments(),
    ]);

    // Fetch 5 most recent unresolved complaints with student + room info
    const recentComplaints = await Complaint.find({ status: { $in: ['pending', 'in_progress'] } })
      .populate({
        path: 'studentId',
        select: 'name roomId',
        populate: { path: 'roomId', select: 'roomNumber' },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        complaints: {
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          total: pendingComplaints + inProgressComplaints + resolvedComplaints,
        },
        rooms: {
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms,
          total: availableRooms + occupiedRooms + maintenanceRooms,
        },
        totalStudents,
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getWardenStats };
