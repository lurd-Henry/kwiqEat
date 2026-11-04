const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cart.controller");

const {

    authenticate,

    authorize

} = require("../middleware/auth.middleware");

router.use(authenticate);

router.use(authorize("customer"));

router.get("/", cartController.getCart);

router.post("/items", cartController.addToCart);

router.patch("/items/:id", cartController.updateCartItem);

router.delete("/items/:id", cartController.removeCartItem);

router.delete("/", cartController.clearCart);

module.exports = router;
