const Review = require('../models/Review');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Create new review or update the review
// @route   PUT /api/v1/reviews
// @access  Private
exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    product: productId,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const isReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (isReviewed) {
    isReviewed.rating = rating;
    isReviewed.comment = comment;
    await isReviewed.save();
  } else {
    await Review.create(review);
  }

  res.status(200).json({
    success: true,
  });
});

// @desc    Get all reviews of a product
// @route   GET /api/v1/reviews/:productId
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.query.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 401));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
  });
});
