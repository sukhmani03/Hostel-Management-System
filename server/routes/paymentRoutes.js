// Payment routes - fee payment processing and history
const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  createOrder,
  verifyPayment,
  createPayment,
  getPaymentHistory,
  getMyPayments,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// IMPORTANT: Specific routes must come before parameterized routes like /:id
router.get('/my', getMyPayments);
router.get('/history/:studentId', getPaymentHistory);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/', getAllPayments);
router.post('/', createPayment);

module.exports = router;
