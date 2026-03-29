// Dashboard routes - admin summary statistics
const express = require('express');
const router = express.Router();
const { getDashboardStats, getWardenStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'warden'), getDashboardStats);
router.get('/warden-stats', protect, authorize('admin', 'warden'), getWardenStats);

module.exports = router;
