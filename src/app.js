const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route files
const auth = require('./routes/authRoutes');
const products = require('./routes/productRoutes');
const categories = require('./routes/categoryRoutes');
const orders = require('./routes/orderRoutes');
const bookings = require('./routes/bookingRoutes');
const reviews = require('./routes/reviewRoutes');
const payment = require('./routes/paymentRoutes');

const errorHandler = require('./middlewares/error');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/categories', categories);
app.use('/api/v1/orders', orders);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/payment', payment);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Siddhis Computers API' });
});

// Use centralized error handler
app.use(errorHandler);

module.exports = app;
