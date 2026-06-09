const { imgBucket, vidBucket, chatBucket } = require("../config/gcs");
const sharp = require("sharp");




const getSignedMediaUrl = async (
    public_id,
    bucket,
    type = "image"
) => {

    if (!public_id) {
        throw new Error(
            "public_id is required"
        );
    }

    const file = bucket.file(public_id);

    // check if file exists
    const [exists] = await file.exists();

    if (!exists) {
        throw new Error(
            "File not found"
        );
    }

    // generate temporary signed URL
    const [signedUrl] =
        await file.getSignedUrl({
            action: "read",
            expires:
                Date.now() +
                1000 * 60 * 5 // 5 min
        });

    return signedUrl;
};

// ==========================
// Upload to Google Cloud Storage
// ==========================
const uploadToGCS = async (
  file,
  folder,
  filename,
  resizeOptions,
  type = "image",
  bucket = null
) => {
  if (!file) {
    throw new Error("No file provided");
  }

  if(!bucket) {
    bucket = type === "video" ? vidBucket : imgBucket;
  }

  let bufferToUpload;
  let finalFileName;
  let contentType;

  // --------------------------
  // IMAGE UPLOAD
  // --------------------------
  if (type === "image") {
    // Validate mimetype
    if (!file.mimetype.startsWith("image/")) {
      throw new Error("Invalid image file type");
    }

    // File size limit (5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image file too large (max 5MB)");
    }

    bufferToUpload = await sharp(file.buffer)
      .resize(resizeOptions.width, resizeOptions.height, {
        fit: "cover",
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();

    finalFileName = `${folder}/${filename}-${Date.now()}.webp`;
    contentType = "image/webp";
  }

  // --------------------------
  // VIDEO UPLOAD
  // --------------------------
  else {
    if (!file.mimetype.startsWith("video/")) {
      throw new Error("Invalid video file type");
    }

    // Example: 200MB limit for videos
    if (file.size > 200 * 1024 * 1024) {
      throw new Error("Video file too large (max 200MB)");
    }

    bufferToUpload = file.buffer;
    finalFileName = `${folder}/${filename}-${Date.now()}-${file.originalname}`;
    contentType = file.mimetype;
  }

  const blob = bucket.file(finalFileName);

  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      resumable: type === "video",
      metadata: {
        contentType,
      },
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      resolve({
        url: `https://storage.googleapis.com/${bucket.name}/${finalFileName}`,
        public_id: finalFileName, // STORE THIS IN DB
        type,
      });
    });

    blobStream.end(bufferToUpload);
  });
};


// ==========================
// Delete from Google Cloud Storage
// ==========================
const deleteFromGCS = async (fileUrl, type = "image") => {
  const bucket = type === "video" ? vidBucket : imgBucket;

  try {
    if (!fileUrl) return;

    const url = new URL(fileUrl);

    // pathname: /bucket-name/folder/file.webp
    const pathParts = url.pathname.split("/").filter(Boolean);

    const bucketName = pathParts[0];
    const objectPath = pathParts.slice(1).join("/");

    if (bucketName !== bucket.name) {
      throw new Error("Bucket mismatch");
    }

    console.log("Deleting:", objectPath);

    await bucket.file(objectPath).delete();

    console.log("Deleted successfully");

  } catch (err) {
    console.error("Delete failed:", err.message);
  }
};

// Deletion using public_id
const deleteFromGCSSecure = async (
    public_id,
    type = "image"
) => {

    try {

        if (!public_id) {
            throw new Error(
                "public_id is required"
            );
        }

        const bucket =
            chatBucket

        const file = bucket.file(public_id);

        // check if file exists
        const [exists] = await file.exists();

        if (!exists) {
            throw new Error(
                "File does not exist in bucket"
            );
        }

        // delete file
        await file.delete();

        return {
            success: true,
            message: "File deleted successfully"
        };

    } catch (err) {

        console.error(
            "GCS Delete Error:",
            err.message
        );

        throw err;
    }
};

module.exports = {
  getSignedMediaUrl,
  uploadToGCS,
  deleteFromGCS,
  deleteFromGCSSecure
};