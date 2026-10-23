const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireAuth } = require("../middleware/auth");
router.post("/", requireAuth, orderController.createOrder);
router.get("/my", requireAuth, orderController.myOrders);
module.exports = router;
