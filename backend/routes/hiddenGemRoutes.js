const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { optionalAuth } = require("../middleware/authMiddleware");

const {
  createHiddenGem,
  getHiddenGems,
  getUserHiddenGems,
  getAllHiddenGems,
  updateHiddenGemStatus,
  deleteHiddenGem,
} = require("../controllers/hiddenGemController");

// Public: Get all approved hidden gems
router.get("/", getHiddenGems);

// Protected: Get current user's submitted hidden gems
router.get("/my-submissions", protect, getUserHiddenGems);

// Protected: Submit a new hidden gem
router.post("/", protect, createHiddenGem);

// Admin routes
router.get("/all", protect, getAllHiddenGems);
router.patch("/:id/status", protect, updateHiddenGemStatus);
router.delete("/:id", protect, deleteHiddenGem);

module.exports = router;
