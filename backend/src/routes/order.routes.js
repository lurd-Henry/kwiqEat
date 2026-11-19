const express = require("express");

const router = express.Router();

const orderController = require("../controllers/order.controller");

const {

    authenticate,

    authorize

} = require("../middleware/auth.middleware");

router.use(authenticate);

router.use(authorize("customer"));

router.post("/", orderController.createOrder);

router.get("/my-orders", orderController.getMyOrders);

router.get("/:id", orderController.getOrderDetails);

module.exports = router;
