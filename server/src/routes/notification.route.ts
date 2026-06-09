const { getAllNotifications, seenNotification } = require("../controllers/notification.controller");
const express = require('express');



const router = express.Router();



router.get("/", getAllNotifications);

router.patch("/seen/:notificationId", seenNotification);


module.exports = router;