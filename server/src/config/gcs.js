const { Storage } = require("@google-cloud/storage");
const path = require('path');

const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON
);

const storage = new Storage({
  credentials,
  projectId: process.env.GCS_PROJECT_ID
});

const imgBucket = storage.bucket(process.env.GCS_BUCKET_IMAGES);
const vidBucket = storage.bucket(process.env.GCS_BUCKET_VIDEOS);
const chatBucket = storage.bucket(process.env.GCS_BUCKET_CHATS);

module.exports = { imgBucket, vidBucket, chatBucket };
