const express = require("express");

const router = express.Router();

const controller = require("../controllers/restaurant-order.controller");
const requireActiveRestaurant =
    require("../middleware/activeRestaurant.middleware");

const {

    authenticate,

    authorize

} = require("../middleware/auth.middleware");

const verifyRestaurantOwnership = require("../middleware/restaurant.middleware");

router.use(authenticate);

router.use(authorize("restaurant"));

router.use(verifyRestaurantOwnership);

router.get("/", controller.getOrders);

router.patch("/:id/status", controller.updateOrderStatus);

router.get("/sales/summary", controller.getSales);

module.exports = router;
