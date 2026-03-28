// Payment model - tracks hostel fee payments per student per month
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
  },
  // Month/year string e.g. "January 2024"
  month: {
    type: String,
    required: [true, 'Payment month is required'],
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
  },
  // Razorpay transaction fields
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
