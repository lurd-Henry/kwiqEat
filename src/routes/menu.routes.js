const express = require("express");

const router = express.Router();

const menuController = require("../controllers/menu.controller");

const {

    authenticate,

    authorize

} = require("../middleware/auth.middleware");

const verifyRestaurantOwnership = require("../middleware/restaurant.middleware");

const upload = require("../middleware/upload.middleware");

// =====================================

// PUBLIC MENU

// =====================================

router.get(

    "/public/:slug",

    menuController.getPublicMenu

);

// =====================================

// RESTAURANT MENU MANAGEMENT

// =====================================

router.get(

    "/",

    authenticate,

    authorize("restaurant"),

    verifyRestaurantOwnership,

    menuController.getMyMenu

);

router.post(

    "/",

    authenticate,

    authorize("restaurant"),

    verifyRestaurantOwnership,

    upload.single("image"),

    menuController.createFood

);

router.put(

    "/:id",

    authenticate,

    authorize("restaurant"),

    verifyRestaurantOwnership,

    upload.single("image"),

    menuController.updateFood

);

router.delete(

    "/:id",

    authenticate,

    authorize("restaurant"),

    verifyRestaurantOwnership,

    menuController.deleteFood

);

module.exports = router;
