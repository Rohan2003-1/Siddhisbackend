const express = require('express');
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.route('/').post(protect, newOrder).get(protect, authorize('admin'), allOrders);

router.route('/me').get(protect, myOrders);

router
  .route('/:id')
  .get(protect, getSingleOrder)
  .put(protect, authorize('admin'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

module.exports = router;
