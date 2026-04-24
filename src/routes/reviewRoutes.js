const express = require('express');
const {
  createProductReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

router.route('/')
  .put(protect, createProductReview)
  .delete(protect, deleteReview);

router.route('/:productId').get(getProductReviews);

module.exports = router;
