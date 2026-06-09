export function generateVideoThumbnail(file, seekTime = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.preload = "metadata";
    video.src = URL.createObjectURL(file);

    // Wait for metadata (duration, size)
    video.onloadedmetadata = () => {
      // If video shorter than seek time → go to middle
      const time = Math.min(seekTime, video.duration / 2);
      video.currentTime = time;
    };

    video.onseeked = () => {
      canvas.width = 320;   // you already chose this size
      canvas.height = 180;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to image
      const imageUrl = canvas.toDataURL("image/png");

      URL.revokeObjectURL(video.src);   // cleanup
      resolve(imageUrl);
    };

    video.onerror = (err) => {
      reject("Failed to load video");
    };
  });
}