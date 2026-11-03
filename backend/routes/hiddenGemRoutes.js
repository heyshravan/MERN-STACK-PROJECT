const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware");
const { uploadGemPhotos } = require("../middleware/uploadMiddleware");

const {
  createHiddenGem,
  getHiddenGems,
  getUserHiddenGems,
  getAllHiddenGems,
  getHiddenGemStatus,
  retryHiddenGemReconstruction,
  updateHiddenGemStatus,
  deleteHiddenGem,
} = require("../controllers/hiddenGemController");

// Public: Get all approved hidden gems (for community 3D gallery)
router.get("/", getHiddenGems);

// Public / User: Check 3D processing status of a submission
router.get("/:id/status", getHiddenGemStatus);

// Protected: Get current user's submitted hidden gems
router.get("/my-submissions", protect, getUserHiddenGems);

// Protected: Submit a new hidden gem (supports up to 10 photos via multipart/form-data)
router.post("/", protect, (req, res, next) => {
  uploadGemPhotos.array("photos", 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createHiddenGem);

// Protected: Retry a failed 3D reconstruction
router.post("/:id/retry", protect, retryHiddenGemReconstruction);

// Admin-only: Review all submissions (pending, approved, rejected)
router.get("/all", protect, adminOnly, getAllHiddenGems);

// Admin-only: Approve or reject submissions and 3D models
router.patch("/:id/status", protect, adminOnly, updateHiddenGemStatus);

// Protected: Delete a hidden gem (owner or admin)
router.delete("/:id", protect, deleteHiddenGem);

module.exports = router;
