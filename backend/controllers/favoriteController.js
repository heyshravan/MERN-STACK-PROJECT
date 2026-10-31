const Favorite = require("../models/favorite");

// Add a place to favorites
const addFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.create(req.body);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find()
      .populate("user", "name")
      .populate("place", "name image");

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get favorites of a particular user
const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.params.userId })
      .populate("place", "name image");

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a favorite
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  getUserFavorites,
  removeFavorite,
};