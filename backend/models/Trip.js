
const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    duration: {
      type: Number,
      min: 1,
    },

    budget: {
      type: Number,
      min: 0,
    },

    interests: {
      type: [String],
      default: [],
    },

    itinerary: [
      {
        day: Number,
        activities: [String],
      },
    ],

    status: {
      type: String,
      enum: ["Planning", "Completed", "Cancelled"],
      default: "Planning",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
