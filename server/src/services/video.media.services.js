const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

/**
 * Get video duration
 */
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

/**
 * Generate thumbnail
 */
function generateVideoThumbnail(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}-thumb.jpg`;

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["10%"],
        filename: fileName,
        folder: outputDir,
        size: "320x?",
      })
      .on("end", () => resolve(path.join(outputDir, fileName)))
      .on("error", reject);
  });
}

module.exports = {
  getVideoDuration,
  generateVideoThumbnail,
};
