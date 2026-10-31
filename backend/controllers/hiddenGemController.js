const HiddenGem = require("../models/hiddengem");

// Submit a hidden gem
const createHiddenGem = async (req, res) => {
  try {
    const hiddenGem = await HiddenGem.create(req.body);
    res.status(201).json(hiddenGem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get approved hidden gems
const getHiddenGems = async (req, res) => {
  try {
    const hiddenGems = await HiddenGem.find({ status: "Approved" })
      .populate("submittedBy", "name");

    res.status(200).json(hiddenGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all submissions (for admin review)
const getAllHiddenGems = async (req, res) => {
  try {
    const hiddenGems = await HiddenGem.find()
      .populate("submittedBy", "name");

    res.status(200).json(hiddenGems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject a submission
const updateHiddenGemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
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

    res.status(200).json(hiddenGem);
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
  getAllHiddenGems,
  updateHiddenGemStatus,
  deleteHiddenGem,
};