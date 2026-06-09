const multer = require("multer");

// Use memory storage (needed for sharp + direct GCS upload)
const storage = multer.memoryStorage();

// File filter (VERY IMPORTANT)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter,
});

module.exports = upload;