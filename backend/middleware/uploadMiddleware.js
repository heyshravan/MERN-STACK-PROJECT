const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Ensure upload directories exist
const photosDir = path.join(__dirname, "../uploads/hidden-gems/photos");
const modelsDir = path.join(__dirname, "../uploads/hidden-gems/models");

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(8).toString("hex");
    const safeName = `gem-${Date.now()}-${randomHex}${ext}`;
    cb(null, safeName);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.originalname}". Only JPG, JPEG, PNG, and WEBP images are supported.`
      ),
      false
    );
  }
};

// Multer upload instance: max 10 photos, 10MB each
const uploadGemPhotos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10, // Max 10 images per upload
  },
});

module.exports = {
  uploadGemPhotos,
  photosDir,
  modelsDir,
};
