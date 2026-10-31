
const Place = require("../models/place");

// CREATE a new place
const createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);

    res.status(201).json({
      message: "Place created successfully",
      place,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// READ all places
const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();

    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// READ a single place
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.status(200).json(place);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE a place
const updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.status(200).json({
      message: "Place updated successfully",
      place,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE a place
const deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.status(200).json({
      message: "Place deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
};
