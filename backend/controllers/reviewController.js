const Review = require("../models/Review");

// CREATE review
const createReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user;
    const placeId = req.body.place;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Please login to write a review.",
      });
    }

    if (!placeId) {
      return res.status(400).json({
        message: "Destination ID (place) is required.",
      });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5 stars.",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Review comment cannot be empty.",
      });
    }

    // Check for duplicate review by same user for same destination
    const existing = await Review.findOne({ user: userId, place: placeId });
    if (existing) {
      return res.status(409).json({
        message: "You have already reviewed this destination.",
      });
    }

    const review = await Review.create({
      user: userId,
      place: placeId,
      rating: numRating,
      comment: comment.trim(),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name");

    res.status(201).json({
      message: "Review submitted successfully!",
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this destination.",
      });
    }
    res.status(400).json({
      message: error.message,
    });
  }
};

// READ all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("place", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// READ reviews for one destination
const getReviewsByPlace = async (req, res) => {
  try {
    const reviews = await Review.find({
      place: req.params.placeId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE review
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewsByPlace,
  updateReview,
  deleteReview,
};
