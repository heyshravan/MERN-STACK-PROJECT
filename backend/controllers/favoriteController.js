
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");

const addFavorite = async (req, res) => {
  try {
    console.log("========== ADD FAVORITE ==========");
    console.log("Authenticated user:", req.user);
    console.log("Request body:", req.body);

    const userId = req.user?.id;
    const placeId = req.body?.place;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing from authentication.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid authenticated user ID.",
      });
    }

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({
        message: "Invalid place ID.",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: userId,
      place: placeId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        message: "Already added to favorites.",
      });
    }

    const favorite = new Favorite({
      user: new mongoose.Types.ObjectId(userId),
      place: new mongoose.Types.ObjectId(placeId),
    });

    await favorite.save();

    return res.status(201).json({
      message: "Added to favorites successfully!",
      favorite,
    });

  } catch (error) {
    console.error("Favorite saving error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.id,
    }).populate("place");

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found.",
      });
    }

    return res.status(200).json({
      message: "Favorite removed successfully!",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
