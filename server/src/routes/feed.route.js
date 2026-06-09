const express = require('express');
const auth = require("../middlewares/authMiddleware");


const router = express.Router();


router.get("", auth, (req, res) => {
    console.log("User has the token");
    res.status(200).json({ message : "User permitted to view" });
});

module.exports = router;