// Complaint routes - submit, view, and manage complaints
const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllComplaints);
router.get('/:id', getComplaint);
router.post('/', createComplaint);
router.put('/:id', authorize('admin', 'warden'), updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
