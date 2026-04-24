const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorResponse('Email already registered. Please log in.', 400));
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
  });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send Email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Siddhis Computers',
      message: `Your verification code is: ${otp}`,
      html: `
        <div style="background-color: #f4f7f6; padding: 50px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f1;">
            <!-- Header -->
            <div style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Siddhis Computers</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">One step closer to your new account</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px; text-align: center;">
              <div style="margin-bottom: 30px;">
                <img src="https://cdn-icons-png.flaticon.com/512/6195/6195931.png" alt="Verification" style="width: 80px; height: auto;">
              </div>
              
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Hello <strong>${name}</strong>,<br>
                Thank you for choosing Siddhis Computers. To complete your registration, please use the 6-digit verification code below:
              </p>
              
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #bfdbfe;">
                <span style="font-size: 42px; font-weight: 800; color: #2563eb; letter-spacing: 12px; font-family: monospace;">${otp}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                This code is valid for <strong>10 minutes</strong>.<br>
                If you did not request this email, please ignore it.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} Siddhis Computers. All rights reserved.<br>
                123 Computer St, Tech City, India
              </p>
            </div>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP.',
    });
  } catch (err) {
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if verified (if you want to force verification before login)
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email before logging in', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Sync cart items
// @route   PUT /api/v1/auth/synccart
// @access  Private
exports.syncCart = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { cart: req.body.cartItems },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user.cart,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
