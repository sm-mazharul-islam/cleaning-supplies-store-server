const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  getFlashSale,
  getFlashSaleDetails,
  deleteProduct,
  getAdminStats,
  createOrder,
  getAllOrders,
  getUserOrders,
  deleteUserOrder,
  updateOrderStatus,
  adminDeleteOrder,
  getUserStats,
} = require("../controllers/product.controller");

const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

// ==========================================
// FIXED ROUTE ORDERING (Static Routes First)
// ==========================================

// ---  Flash Sale Products (Public Access) ---
router.get("/flash-sale", getFlashSale);

router.get("/flash-sale/:id", getFlashSaleDetails);

// ---  Dynamic Admin Stats (Analytics) ---

router.get("/admin-stats", verifyToken, verifyAdmin, getAdminStats);

// --- Dynamic User Stats (Personal Analytics) ---

// URL: GET /api/v1/products/user-stats/:email
router.get("/user-stats/:email", verifyToken, getUserStats);

// URL: GET /api/v1/products/orders
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);

// --- View Specific User's Orders ---
// URL: GET /api/v1/products/orders/user/:email
router.get("/orders/user/:email", verifyToken, getUserOrders);

// ==========================================
// ORDER MANAGEMENT (Authenticated Users Only)
// ==========================================

// Create a New Order
router.post("/orders", verifyToken, createOrder);

// Delete/Cancel Order by User (24-hour limit logic inside controller)
router.delete("/orders/:id", verifyToken, deleteUserOrder);

// Update Order Status (Admin Approval)
router.patch("/orders/:id", verifyToken, verifyAdmin, updateOrderStatus);

// Admin Specific Order Delete (No time limit)
router.delete("/admin/orders/:id", verifyToken, verifyAdmin, adminDeleteOrder);

// ==========================================
// PRODUCT MANAGEMENT (Public & Admin)
// ==========================================

// Get all products (Public - with pagination & search)
router.get("/", getProducts);

// View Specific Product by ID (Public)

router.get("/:id", getProductById);

// Add a New Product (Admin Only)
router.post("/", verifyToken, verifyAdmin, addProduct);

// Update/Edit Product (Admin Only)
router.patch("/:id", verifyToken, verifyAdmin, updateProduct);

// Delete Product (Admin Only)
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
