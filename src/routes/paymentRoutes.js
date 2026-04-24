const express = require('express');
const {
  processPayment,
  sendStripeApi,
} = require('../controllers/paymentController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

router.route('/process').post(protect, processPayment);
router.route('/stripeapi').get(protect, sendStripeApi);

module.exports = router;
