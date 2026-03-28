// Dashboard routes - admin summary statistics
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'warden'), getDashboardStats);

module.exports = router;
