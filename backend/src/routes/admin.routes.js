const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin.controller");

const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");

router.use(authenticate);
router.use(authorize("admin"));

router.get("/overview", controller.getOverview);

router.get("/customers", controller.getCustomers);

router.get("/orders", controller.getOrders);

router.get("/categories", controller.getCategories);

router.post("/categories", controller.createCategory);

module.exports = router;
