const express = require("express");
const router = express.Router();
const { register, login, syncUser } = require("../controllers/auth.controller");

// Endpoint: POST /api/v1/auth/register
router.post("/register", register);

// Endpoint: POST /api/v1/auth/login
router.post("/login", login);

// Endpoint: POST /api/v1/auth/sync
router.post("/sync", syncUser);

module.exports = router;
