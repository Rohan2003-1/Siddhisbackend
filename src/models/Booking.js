const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify the service type'],
    enum: ['Exam Form', 'PF Service', 'Computer Repair', 'Software Installation', 'Other'],
  },
  details: {
    type: String,
    required: [true, 'Please provide details for the service'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please select a date'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Please select a time slot'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  adminComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
