// Complaint model - tracks maintenance and other complaints from students
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
  },
  category: {
    type: String,
    enum: ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'],
    required: [true, 'Category is required'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending',
  },
  // Staff member assigned to resolve the complaint
  assignedTo: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
  // Notes added by admin/warden about resolution
  adminNote: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);
