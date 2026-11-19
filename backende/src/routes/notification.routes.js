const express = require("express");
const router = express.Router();

const controller = require("../controllers/notification.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", controller.getNotifications);

router.patch("/:id/read", controller.markAsRead);

module.exports = router;
