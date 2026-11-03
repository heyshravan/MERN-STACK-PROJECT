const { processGemReconstruction } = require("./localWorker");
const HiddenGem = require("../../models/HiddenGem");

class ReconstructionManager {
  constructor() {
    this.engine = process.env.RECONSTRUCTION_ENGINE || "local";
  }

  /**
   * Enqueue a new Photo-to-3D reconstruction job asynchronously
   */
  async enqueueJob(gemId, photoPaths, options = {}) {
    console.log(
      `[Reconstruction Manager] Enqueueing 3D reconstruction for Gem ID: ${gemId} (${photoPaths.length} photos) using [${this.engine}] engine.`
    );

    // Initial status update
    await HiddenGem.findByIdAndUpdate(gemId, {
      processingStatus: "Uploaded",
      processingProgress: 5,
      processingStep: "Photographs securely uploaded and stored.",
      processingError: null,
    });

    // Run asynchronously without blocking Express HTTP thread
    setImmediate(() => {
      processGemReconstruction(gemId, photoPaths, options).catch((err) => {
        console.error(`[Reconstruction Manager] Uncaught error in worker for gem ${gemId}:`, err);
      });
    });

    return {
      success: true,
      jobId: gemId,
      status: "Uploaded",
      engine: this.engine,
    };
  }

  /**
   * Retry a failed reconstruction job
   */
  async retryJob(gemId) {
    const gem = await HiddenGem.findById(gemId);
    if (!gem) {
      throw new Error("Hidden gem not found.");
    }

    if (!gem.photos || gem.photos.length === 0) {
      throw new Error("No source photographs available for this gem to reconstruct.");
    }

    return this.enqueueJob(gem._id, gem.photos);
  }
}

const managerInstance = new ReconstructionManager();
module.exports = managerInstance;
