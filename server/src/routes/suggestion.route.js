const express = require('express');
const { getUserSuggestion } = require('../controllers/suggestion.controller');


const router = express.Router();



router.get("/users", getUserSuggestion);


module.exports = router;