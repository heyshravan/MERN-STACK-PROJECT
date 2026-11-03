const express = require("express");
const router = express.Router();

const {
  getAIStatus,
  chatWithAI,
} = require("../controllers/aiController");

// Check AI status
router.get("/status", getAIStatus);

// Chat with AI
router.post("/chat", chatWithAI);

module.exports = router;
