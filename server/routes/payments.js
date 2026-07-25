const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payments/create-order - Initiate order flow
router.post('/create-order', authenticateToken, (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'courseId is required.' });
  }

  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  // Create a mock order object representing standard Razorpay response
  const mockOrder = {
    id: 'order_' + Math.random().toString(36).substr(2, 10),
    amount: course.price * 100, // Razorpay works in paise
    currency: 'INR',
    receipt: 'receipt_' + Math.random().toString(36).substr(2, 6),
    status: 'created',
    courseId: course.id,
    courseTitle: course.title,
    createdAt: Date.now()
  };

  res.json(mockOrder);
});

// POST /api/payments/verify-payment - Confirm successful payment & upgrade role
router.post('/verify-payment', authenticateToken, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, courseId } = req.body;
  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || !courseId) {
    return res.status(400).json({ message: 'Missing payment confirmation parameters.' });
  }

  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  try {
    // 1. Upgrade user role in database to premium_student
    db.updateUser(userId, { role: 'premium_student' });

    // 2. Generate and record a payment transaction / invoice
    const newInvoice = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      user_id: userId,
      amount: course.price,
      course_id: courseId,
      course_title: course.title,
      status: 'captured',
      date: new Date().toISOString()
    };

    db.createPayment(newInvoice);

    res.json({
      success: true,
      message: 'Payment verified and courses unlocked successfully!',
      invoice: newInvoice
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error during payment verification.' });
  }
});

// GET /api/payments/history - Fetch invoices for a student
router.get('/history', authenticateToken, (req, res) => {
  const payments = db.getPayments().filter(p => p.user_id === req.user.id);
  res.json(payments);
});

module.exports = router;
