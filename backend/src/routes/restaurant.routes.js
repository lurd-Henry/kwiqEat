const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const restaurantController = require("../controllers/restaurant.controller");

const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");

const verifyRestaurantOwnership = require("../middleware/restaurant.middleware");


// =====================================
// PUBLIC ROUTES
// =====================================

// Restaurant registration

router.post(
    "/register",

    [
        body("owner_name").trim().notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 8 }),
        body("restaurant_name").trim().notEmpty(),
        body("address").trim().notEmpty()
    ],

    (req, res, next) => {

        const { validationResult } = require("express-validator");

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();

    },

    restaurantController.registerRestaurant
);


// Browse active restaurants

router.get(
    "/public",
    restaurantController.getPublicRestaurants
);


// =====================================
// RESTAURANT OWNER ROUTES
// =====================================

router.get(
    "/my-restaurant",
    authenticate,
    authorize("restaurant"),
    verifyRestaurantOwnership,
    restaurantController.getMyRestaurant
);


router.put(
    "/my-restaurant",
    authenticate,
    authorize("restaurant"),
    verifyRestaurantOwnership,
    restaurantController.updateMyRestaurant
);


router.patch(
    "/my-restaurant/availability",
    authenticate,
    authorize("restaurant"),
    verifyRestaurantOwnership,
    restaurantController.toggleRestaurant
);


// =====================================
// ADMIN ROUTES
// =====================================

router.get(
    "/admin/all",
    authenticate,
    authorize("admin"),
    restaurantController.getAllRestaurants
);


router.patch(
    "/admin/:id/status",
    authenticate,
    authorize("admin"),
    restaurantController.updateRestaurantStatus
);


module.exports = router;
