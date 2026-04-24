const express = require('express');
const {
  register,
  verifyOTP,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/seed-admin', (req, res) => {
  const User = require('../models/User');
  User.create({
    name: 'Admin User',
    email: 'admin@siddhis.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  }).then(() => res.json({ message: 'Admin created: admin@siddhis.com / admin123' }))
    .catch(err => res.status(400).json({ error: err.message }));
});
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/synccart', protect, require('../controllers/authController').syncCart);

module.exports = router;
