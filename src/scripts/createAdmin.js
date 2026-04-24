const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const adminEmail = 'admin@siddhis.com';
    const adminPass = 'admin123';

    // Check if admin exists
    let user = await User.findOne({ email: adminEmail });
    if (user) {
      console.log('Admin user already exists. Updating role to admin...');
      user.role = 'admin';
      user.isVerified = true;
      user.password = adminPass;
      await user.save();
    } else {
      console.log('Creating new admin user...');
      user = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPass,
        role: 'admin',
        isVerified: true
      });
    }

    console.log('Admin user created/updated successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPass);
    process.exit();
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
