
const express = require("express");

const router = express.Router();

const {
  createReview,
  getReviews,
  getReviewsByPlace,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// CREATE a review
router.post("/", createReview);

// READ all reviews
router.get("/", getReviews);

// READ reviews for a particular place
router.get("/place/:placeId", getReviewsByPlace);

// UPDATE a review
router.put("/:id", updateReview);

// DELETE a review
router.delete("/:id", deleteReview);

module.exports = router;
