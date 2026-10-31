
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

// All trip routes require login
router.use(protect);

router.post("/", createTrip);
router.get("/", getUserTrips);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
