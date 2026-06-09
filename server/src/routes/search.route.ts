const express = require('express');
const { getSearchResults, getSearchRelated, addSearchedUsers } = require("../controllers/search.controller");

const router = express.Router();

router.get("/keyword", getSearchResults);

router.post("/input", getSearchRelated);

router.patch("/searchedUsers/:requestedUserId", addSearchedUsers);

module.exports = router;