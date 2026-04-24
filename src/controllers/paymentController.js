const asyncHandler = require('../middlewares/async');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Process stripe payments
// @route   POST /api/v1/payment/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'usd',
    metadata: { integration_check: 'accept_a_payment' },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

// @desc    Send stripe API Key
// @route   GET /api/v1/payment/stripeapi
// @access  Private
exports.sendStripeApi = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});
