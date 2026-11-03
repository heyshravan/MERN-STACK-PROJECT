const HiddenGem = require("../models/HiddenGem");
const reconstructionManager = require("../services/reconstruction/reconstructionManager");

// Submit a hidden gem with optional multiple photographs for 3D reconstruction
const createHiddenGem = async (req, res) => {
  try {
    const submittedBy = req.user?.id || req.body.submittedBy;
    if (!submittedBy) {
      return res.status(401).json({
        message: "Please login to submit a hidden tourist destination.",
      });
    }

    const {
      name,
      description,
      location,
      country,
      state,
      category,
      image,
      historyAndSignificance,
      latitude,
      longitude,
    } = req.body;

    if (!name?.trim() || !description?.trim() || !location?.trim() || !country?.trim()) {
      return res.status(400).json({
        message: "Name, description, location, and country are required.",
      });
    }

    // Process uploaded photographs from Multer if present
    const photoUrls = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        photoUrls.push(`/uploads/hidden-gems/photos/${file.filename}`);
      });
    }

    // Cover image: either provided as URL, or default to first uploaded photograph
    let coverImage = image?.trim() || "";
    if (!coverImage && photoUrls.length > 0) {
      coverImage = photoUrls[0];
    }

    // Parse coordinates if provided
    let lat = undefined;
    let lng = undefined;
    if (latitude !== undefined && latitude !== "" && !isNaN(Number(latitude))) {
      lat = Number(latitude);
    }
    if (longitude !== undefined && longitude !== "" && !isNaN(Number(longitude))) {
      lng = Number(longitude);
    }

    const hasPhotos = photoUrls.length > 0;

    const hiddenGem = await HiddenGem.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      country: country.trim(),
      state: state?.trim() || "",
      category: category || "Nature",
      image: coverImage,
      photos: photoUrls,
      historyAndSignificance: historyAndSignificance?.trim() || "",
      latitude: lat,
      longitude: lng,
      submittedBy,
      status: "Pending", // Default review status
      processingStatus: hasPhotos ? "Uploaded" : "None",
      reconstructionMethod: hasPhotos
        ? photoUrls.length >= 3
          ? "photogrammetry"
          : "ai-single-image-approximation"
        : "none",
    });

    // If photographs were provided, enqueue 3D reconstruction asynchronously
    if (hasPhotos) {
      await reconstructionManager.enqueueJob(hiddenGem._id, photoUrls);
    }

    res.status(201).json({
      message: hasPhotos
        ? `Hidden gem submitted with ${photoUrls.length} photograph(s)! 3D reconstruction started.`
        : "Hidden gem submitted successfully! It is currently pending review.",
      hiddenGem,
    });
  } catch (error) {
    console.error("Create hidden gem error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get approved hidden gems (public)
const getHiddenGems = async (req, res) => {
  try {
    const hiddenGems = await HiddenGem.find({ status: "Approved" })
      .populate("submittedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(hiddenGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get submissions of the currently logged-in user
const getUserHiddenGems = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const myGems = await HiddenGem.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(myGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all submissions (for admin review)
const getAllHiddenGems = async (req, res) => {
  try {
    const hiddenGems = await HiddenGem.find()
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(hiddenGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check 3D processing status of a single gem
const getHiddenGemStatus = async (req, res) => {
  try {
    const gem = await HiddenGem.findById(req.params.id)
      .select("processingStatus processingProgress processingStep processingError model3DUrl reconstructionMethod modelQuality status");

    if (!gem) {
      return res.status(404).json({ message: "Hidden gem not found." });
    }

    res.status(200).json(gem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retry failed 3D reconstruction
const retryHiddenGemReconstruction = async (req, res) => {
  try {
    const gem = await HiddenGem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: "Hidden gem not found." });
    }

    // Verify ownership or admin
    if (String(gem.submittedBy) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to retry this reconstruction." });
    }

    await reconstructionManager.retryJob(gem._id);

    res.status(200).json({
      message: "3D reconstruction re-queued successfully.",
      gemId: gem._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve or reject a submission (Admin)
const updateHiddenGemStatus = async (req, res) => {
  try {
    const { status, rejectionReason, approve3DModel } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending, Approved, or Rejected",
      });
    }

    const updateData = { status };
    if (status === "Approved") {
      updateData.approvedAt = new Date();
      updateData.rejectionReason = "";
      if (approve3DModel === false) {
        // Disallow 3D model if rejected separately
        updateData.model3DUrl = "";
      }
    } else if (status === "Rejected") {
      updateData.rejectionReason = rejectionReason?.trim() || "Submission did not meet community standards.";
    }

    const hiddenGem = await HiddenGem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    if (!hiddenGem) {
      return res.status(404).json({ message: "Hidden gem not found" });
    }

    res.status(200).json({
      message: `Hidden gem status updated to ${status}!`,
      hiddenGem,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a hidden gem
const deleteHiddenGem = async (req, res) => {
  try {
    const gem = await HiddenGem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: "Hidden gem not found" });
    }

    // Verify ownership or admin
    if (String(gem.submittedBy) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this gem." });
    }

    await HiddenGem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Hidden gem deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHiddenGem,
  getHiddenGems,
  getUserHiddenGems,
  getAllHiddenGems,
  getHiddenGemStatus,
  retryHiddenGemReconstruction,
  updateHiddenGemStatus,
  deleteHiddenGem,
};
