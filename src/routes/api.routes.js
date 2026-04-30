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

module.exports = router;
