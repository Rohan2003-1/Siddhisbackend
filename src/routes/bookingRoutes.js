const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(protect, authorize('admin'), getAllBookings)
  .post(protect, createBooking);

router.route('/me').get(protect, getMyBookings);

router.route('/:id')
  .put(protect, authorize('admin'), updateBookingStatus);

module.exports = router;
