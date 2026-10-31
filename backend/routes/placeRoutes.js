
const express = require("express");

const router = express.Router();

const {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
} = require("../controllers/placeController");

// CREATE a place
router.post("/", createPlace);

// READ all places
router.get("/", getPlaces);

// READ one place
router.get("/:id", getPlaceById);

// UPDATE a place
router.put("/:id", updatePlace);

// DELETE a place
router.delete("/:id", deletePlace);

module.exports = router;
