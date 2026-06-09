const { Storage } = require("@google-cloud/storage");
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(process.cwd(),
    "config",
    "vibeo-485708-ea6db0cfb272.json"),
  projectId: process.env.GCS_PROJECT_ID
});

const imgBucket = storage.bucket(process.env.GCS_BUCKET_IMAGES);
const vidBucket = storage.bucket(process.env.GCS_BUCKET_VIDEOS);
const chatBucket = storage.bucket(process.env.GCS_BUCKET_CHATS);

module.exports = { imgBucket, vidBucket, chatBucket };
