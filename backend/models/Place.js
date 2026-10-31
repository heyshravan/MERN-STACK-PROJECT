
const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Historical",
        "Nature",
        "Adventure",
        "Religious",
        "Beach",
        "Other",
      ],
      default: "Other",
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
    },

    city: {
      type: String,
    },

    address: {
      type: String,
    },

    image: {
      type: String,
    },

    historicalInfo: {
      type: String,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Place", placeSchema);
