const Review = require("../models/Review");

// CREATE review
const createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
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
    const existing = await Review.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Ownership check: only review author or admin can update
    if (existing.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to modify this review.",
      });
    }

    const updates = {};
    if (req.body.rating != null) {
      const r = Number(req.body.rating);
      if (r < 1 || r > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
      }
      updates.rating = r;
    }
    if (req.body.comment != null) {
      if (!req.body.comment.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty." });
      }
      updates.comment = req.body.comment.trim();
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

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
    const existing = await Review.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Ownership check: only review author or admin can delete
    if (existing.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

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
