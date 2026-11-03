const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from adding the same place twice
favoriteSchema.index(
  { user: 1, place: 1 },
  { unique: true }
);

module.exports = mongoose.model("Favorite", favoriteSchema);