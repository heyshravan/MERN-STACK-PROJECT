
const Trip = require("../models/trip");

// CREATE trip for logged-in user
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Trip created successfully!",
      trip,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET only logged-in user's trips
const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET one trip belonging to logged-in user
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE only user's own trip
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        $set: {
          destination: req.body.destination,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          duration: req.body.duration,
          budget: req.body.budget,
          interests: req.body.interests,
          itinerary: req.body.itinerary,
          status: req.body.status,
        },
      },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.json({
      message: "Trip updated successfully!",
      trip,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE only user's own trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.json({ message: "Trip deleted successfully!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};
