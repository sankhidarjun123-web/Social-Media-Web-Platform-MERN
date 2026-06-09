const express = require('express');
const { createProfile, editProfile } = require('../controllers/profile.controller');
const upload = require("../middlewares/uploadMiddleware");
const auth = require("../middlewares/authMiddleware");



const router = express.Router();


router.post("/create", 
upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "coverImg", maxCount: 1 }
  ]),
  createProfile);

router.patch("/edit",
  upload.fields([
    { name: "currentProfileImg", maxCount: 1 },
    { name: "currentCoverImg", maxCount: 1 }
  ]), editProfile)

module.exports = router;