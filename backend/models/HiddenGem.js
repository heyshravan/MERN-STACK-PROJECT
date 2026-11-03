const mongoose = require("mongoose");

const hiddenGemSchema = new mongoose.Schema(
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

    location: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
    },

    category: {
      type: String,
      enum: ["Nature", "Historical", "Adventure", "Religious", "Beach", "Cultural", "Other"],
      default: "Nature",
    },

    image: {
      type: String,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HiddenGem", hiddenGemSchema);
