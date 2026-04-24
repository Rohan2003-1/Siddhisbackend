const asyncHandler = require('../middlewares/async');


// @desc    Process stripe payments
// @route   POST /api/v1/payment/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')) {
    return next(new Error('Stripe Secret Key is not configured correctly.'));
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
