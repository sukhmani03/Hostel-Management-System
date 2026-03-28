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

module.exports = { getDashboardStats };
