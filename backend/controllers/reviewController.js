
const Review = require("../models/review");

// CREATE review
const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
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
      .populate("place", "name");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// READ reviews for one place
const getReviewsByPlace = async (req, res) => {
  try {
    const reviews = await Review.find({
      place: req.params.placeId,
    })
      .populate("user", "name")
      .populate("place", "name");

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
      { new: true, runValidators: true }
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
