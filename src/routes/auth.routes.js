const express = require("express");
const router = express.Router();
const { register, login, syncUser } = require("../controllers/auth.controller");

// ১. নতুন ইউজার রেজিস্ট্রেশন রাউট
// Endpoint: POST /api/v1/auth/register
router.post("/register", register);

// ২. সাধারণ ইমেইল/পাসওয়ার্ড লগইন রাউট
// Endpoint: POST /api/v1/auth/login
router.post("/login", login);

// ৩. ফায়ারবেস গুগল লগইন ডেটা সিঙ্ক রাউট (Upsert)
// Endpoint: POST /api/v1/auth/sync
router.post("/sync", syncUser);

module.exports = router;
