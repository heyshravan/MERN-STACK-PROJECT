const HiddenGem = require("../models/HiddenGem");

// Submit a hidden gem
const createHiddenGem = async (req, res) => {
  try {
    const submittedBy = req.user?.id || req.body.submittedBy;
    if (!submittedBy) {
      return res.status(401).json({
        message: "Please login to submit a hidden tourist destination.",
      });
    }

    const { name, description, location, country, state, category, image } = req.body;

    if (!name?.trim() || !description?.trim() || !location?.trim() || !country?.trim()) {
      return res.status(400).json({
        message: "Name, description, location, and country are required.",
      });
    }

    // Validate image URL if provided
    if (image && !/^https?:\/\/.+/i.test(image.trim())) {
      return res.status(400).json({
        message: "Please provide a valid image URL starting with http:// or https://",
      });
    }

    const hiddenGem = await HiddenGem.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      country: country.trim(),
      state: state?.trim() || "",
      category: category || "Nature",
      image: image?.trim() || "",
      submittedBy,
      status: "Pending", // Default status is always Pending
    });

    res.status(201).json({
      message: "Hidden gem submitted successfully! It is currently pending review.",
      hiddenGem,
    });
  } catch (error) {
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
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(hiddenGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject a submission (Admin)
const updateHiddenGemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending, Approved, or Rejected",
      });
    }

    const hiddenGem = await HiddenGem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
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
    const hiddenGem = await HiddenGem.findByIdAndDelete(req.params.id);

    if (!hiddenGem) {
      return res.status(404).json({ message: "Hidden gem not found" });
    }

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
  updateHiddenGemStatus,
  deleteHiddenGem,
};
