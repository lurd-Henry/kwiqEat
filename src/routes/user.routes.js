const express = require("express");
const router = express.Router();

const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");


// Any authenticated user
router.get("/profile", authenticate, (req, res) => {

    res.json({
        success: true,
        message: "You have accessed a protected route.",
        user: req.user
    });

});


// Customer only
router.get(
    "/customer",
    authenticate,
    authorize("customer"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to your customer dashboard."
        });

    }
);


// Restaurant only
router.get(
    "/restaurant",
    authenticate,
    authorize("restaurant"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to your restaurant dashboard."
        });

    }
);


// Admin only
router.get(
    "/admin",
    authenticate,
    authorize("admin"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to the kwiQeat administration panel."
        });

    }
);


module.exports = router;
