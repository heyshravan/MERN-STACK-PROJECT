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

    // Primary cover image (backwards compatible)
    image: {
      type: String,
    },

    // Multiple photographs for photogrammetry / 3D reconstruction
    photos: [
      {
        type: String,
      },
    ],

    historyAndSignificance: {
      type: String,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    // 3D Model Details
    model3DUrl: {
      type: String,
    },

    modelFormat: {
      type: String,
      default: "glb",
    },

    reconstructionMethod: {
      type: String,
      enum: ["photogrammetry", "ai-single-image-approximation", "imported-mesh", "none"],
      default: "none",
    },

    modelQuality: {
      type: String,
      enum: ["Standard", "High", "Approximation"],
      default: "Standard",
    },

    modelAttribution: {
      type: String,
    },

    modelLicense: {
      type: String,
      default: "CC-BY 4.0",
    },

    // 3D Processing Pipeline Lifecycle
    processingStatus: {
      type: String,
      enum: [
        "Uploaded",
        "Waiting for processing",
        "Processing",
        "Reconstruction completed",
        "Processing failed",
        "Awaiting admin approval",
        "Published",
      ],
      default: "Uploaded",
    },

    processingProgress: {
      type: Number,
      default: 0,
    },

    processingStep: {
      type: String,
      default: "",
    },

    processingError: {
      type: String,
    },

    rejectionReason: {
      type: String,
    },

    approvedAt: {
      type: Date,
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
