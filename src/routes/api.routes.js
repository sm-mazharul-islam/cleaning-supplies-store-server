const express = require("express");
const router = express.Router();
const { register, login, syncUser } = require("../controllers/auth.controller");
const { getProducts } = require("../controllers/product.controller");

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/users/sync", syncUser);

// Product Routes
router.get("/products", getProducts);

// Testimonial Routes
router.post("/testimonials", verifyToken, testimonial.createTestimonial);
router.patch(
  "/testimonials/:id",
  verifyToken,
  isAdmin,
  testimonial.updateTestimonial,
);
router.delete("/testimonials/:id", verifyToken, testimonial.deleteTestimonial);

// Order Routes
router.post("/orders", verifyToken, order.createOrder);
router.get("/orders", verifyToken, order.getOrders);
router.patch("/orders/:id", verifyToken, isAdmin, order.updateOrder);
router.delete("/orders/:id", verifyToken, isAdmin, order.deleteOrder);

module.exports = router;
