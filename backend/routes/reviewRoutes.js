const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getReviews,
  getReviewsByPlace,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// CREATE a review (logged-in user)
router.post("/", protect, createReview);

// READ all reviews (public)
router.get("/", getReviews);

// READ reviews for a particular place (public)
router.get("/place/:placeId", getReviewsByPlace);

// UPDATE a review (protected)
router.put("/:id", protect, updateReview);

// DELETE a review (protected)
router.delete("/:id", protect, deleteReview);

module.exports = router;
