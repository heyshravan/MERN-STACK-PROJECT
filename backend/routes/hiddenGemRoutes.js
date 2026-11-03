const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");

const {
  createHiddenGem,
  getHiddenGems,
  getAllHiddenGems,
  updateHiddenGemStatus,
  deleteHiddenGem,
} = require("../controllers/hiddenGemController");

router.post("/", optionalAuth, createHiddenGem);
router.get("/", getHiddenGems);
router.get("/all", getAllHiddenGems);
router.patch("/:id/status", updateHiddenGemStatus);
router.delete("/:id", deleteHiddenGem);

module.exports = router;
