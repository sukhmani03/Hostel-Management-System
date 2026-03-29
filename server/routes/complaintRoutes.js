// Complaint routes - submit, view, and manage complaints
const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getMyComplaints,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// IMPORTANT: /my must come before /:id to avoid being matched as a complaint ID
router.get('/my', getMyComplaints);
router.get('/', authorize('admin', 'warden'), getAllComplaints);
router.get('/:id', getComplaint);
router.post('/', createComplaint);
router.put('/:id', authorize('admin', 'warden'), updateComplaint);
router.delete('/:id', authorize('admin'), deleteComplaint);

module.exports = router;
