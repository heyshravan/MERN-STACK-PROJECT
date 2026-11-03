const express = require("express");
const router = express.Router();

const {
  searchDestinationsController,
  getDestinationDetailsController,
  translateDestinationController,
} = require("../controllers/destinationController");

// Hybrid search (MongoDB + Global entities)
router.get("/search", searchDestinationsController);

// Rich destination guide details
router.get("/details", getDestinationDetailsController);

// Multilingual text translation
router.post("/translate", translateDestinationController);

module.exports = router;
