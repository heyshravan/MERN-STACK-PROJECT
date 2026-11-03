const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per destination
reviewSchema.index({ user: 1, place: 1 }, { unique: true });
// Optimize querying reviews by place sorted by creation date
reviewSchema.index({ place: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
