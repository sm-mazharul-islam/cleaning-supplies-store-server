const express = require("express");
const router = express.Router();

const { getProducts, getProductById, addProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");
const { getFlashSale, getFlashSaleDetails } = require("../controllers/flashSale.controller");
const { createOrder, getUserOrders, deleteUserOrder, getAllOrders, updateOrderStatus, adminDeleteOrder } = require("../controllers/order.controller");
const { getAdminStats, getUserStats } = require("../controllers/stats.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

// Flash Sale Routes
router.get("/flash-sale", getFlashSale);
router.get("/flash-sale/:id", getFlashSaleDetails);

// Analytics & Stats Routes
router.get("/admin-stats", verifyToken, verifyAdmin, getAdminStats);
router.get("/user-stats/:email", verifyToken, getUserStats);

// Order Management Routes
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);
router.get("/orders/user/:email", verifyToken, getUserOrders);
router.post("/orders", verifyToken, createOrder);
router.delete("/orders/:id", verifyToken, deleteUserOrder);
router.patch("/orders/:id", verifyToken, verifyAdmin, updateOrderStatus);
router.delete("/admin/orders/:id", verifyToken, verifyAdmin, adminDeleteOrder);

// Product CRUD Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, verifyAdmin, addProduct);
router.patch("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
