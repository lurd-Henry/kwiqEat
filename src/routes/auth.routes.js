const express = require("express");
const router = express.Router();

const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");


// =====================================
// RATE LIMITING
// =====================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again later."
    }
});


// =====================================
// REGISTRATION
// =====================================

router.post(
    "/register",
    authLimiter,

    [
        body("full_name")
            .trim()
            .notEmpty()
            .withMessage("Full name is required."),

        body("email")
            .isEmail()
            .withMessage("Enter a valid email address."),

        body("phone")
            .optional({ values: "falsy" })
            .isMobilePhone("any")
            .withMessage("Enter a valid phone number."),

        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must contain at least 8 characters.")
    ],

    authController.register
);


// =====================================
// LOGIN
// =====================================

router.post(
    "/login",
    authLimiter,

    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email address."),

        body("password")
            .notEmpty()
            .withMessage("Password is required.")
    ],

    authController.login
);


// =====================================
// CURRENT USER
// =====================================

router.get(
    "/me",
    authenticate,
    authController.getMe
);


module.exports = router;
