const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const booking = await Booking.create(req.body);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Get logged in user bookings
// @route   GET /api/v1/bookings/me
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get all bookings - ADMIN
// @route   GET /api/v1/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find().populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Update booking status - ADMIN
// @route   PUT /api/v1/bookings/:id
// @access  Private/Admin
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse('Booking not found', 404));
  }

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: booking,
  });
});
