// Payment controller - handles fee payments with Razorpay integration
const crypto = require('crypto'); // Built-in Node.js module for signature verification
const Payment = require('../models/Payment');

// Conditionally initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * @desc    Get all payments (admin) or payments for a specific student
 * @route   GET /api/payments
 * @access  Private
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { studentId } : {};
    const payments = await Payment.find(filter)
      .populate('studentId', 'name email rollNumber')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a Razorpay order to initiate payment
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
    }

    const { amount, studentId, month, description } = req.body;

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${studentId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create a pending payment record in the database
    const payment = await Payment.create({
      studentId,
      amount,
      month,
      description,
      status: 'pending',
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order, payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature after successful payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured' });
    }

    // Verify signature: HMAC-SHA256 of "orderId|paymentId" using key secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record to paid
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        paymentDate: new Date(),
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Payment verified successfully', data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a payment record directly (for testing without Razorpay)
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = async (req, res, next) => {
  try {
    const { studentId, amount, month, description, status } = req.body;
    const payment = await Payment.create({
      studentId,
      amount,
      month,
      description,
      status: status || 'paid',
      paymentDate: status === 'paid' || !status ? new Date() : undefined,
    });
    res.status(201).json({ success: true, message: 'Payment record created', data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history for a specific student
 * @route   GET /api/payments/history/:studentId
 * @access  Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history for the currently logged-in student
 * @route   GET /api/payments/my
 * @access  Private (student)
 */
const getMyPayments = async (req, res, next) => {
  try {
    // Find the student profile linked to this user account
    const Student = require('../models/Student');
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const payments = await Payment.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPayments, createOrder, verifyPayment, createPayment, getPaymentHistory, getMyPayments };
