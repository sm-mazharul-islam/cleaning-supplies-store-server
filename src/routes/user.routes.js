const express = require("express");
const router = express.Router();

/**
 * Controller Imports
 * ইউজার কন্ট্রোলার থেকে সকল ফাংশন ইমপোর্ট করা হয়েছে।
 */
const {
  syncUser,
  getProfile,
  updateProfile,
  login,
  deleteProfile,
  getAllUsers, // অ্যাডমিনের জন্য নতুন ফাংশন
  updateUserRole, // রোল পরিবর্তনের জন্য নতুন ফাংশন
  adminDeleteUser, // অ্যাডমিন দ্বারা ইউজার ডিলিটের জন্য নতুন ফাংশন
} = require("../controllers/user.controller");

/**
 * Middleware Imports
 * verifyToken: এটি নিশ্চিত করে যে রিকোয়েস্টে একটি ভ্যালিড JWT টোকেন আছে।
 * verifyAdmin: এটি নিশ্চিত করে যে রিকোয়েস্টকারী একজন অ্যাডমিন।
 */
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

// ================= PUBLIC / AUTH ROUTES =================

// --- ১. ইউজার সিঙ্ক (Initial Login/Register) ---
// URL: POST /api/v1/user/sync
router.post("/sync", syncUser);

// --- ২. ইউজার লগইন (Manual Login) ---
// URL: POST /api/v1/user/login
router.post("/login", login);

// ================= AUTHENTICATED USER ROUTES =================

// --- ৩. প্রোফাইল ডিটেইলস দেখা ---
// URL: GET /api/v1/user/profile
router.get("/profile", verifyToken, getProfile);

// --- ৪. প্রোফাইল আপডেট করা ---
// URL: PATCH /api/v1/user/profile/update
router.patch("/profile/update", verifyToken, updateProfile);

// --- ৫. নিজের প্রোফাইল ডিলিট করা ---
// URL: DELETE /api/v1/user/profile/delete
router.delete("/profile/delete", verifyToken, deleteProfile);

// ================= ADMIN PRIVILEGED ROUTES =================

// --- ৬. সকল ইউজার লিস্ট দেখা (Admin Only) ---
// URL: GET /api/v1/user/all-users
router.get("/all-users", verifyToken, verifyAdmin, getAllUsers);

// --- ৭. ইউজারের রোল পরিবর্তন করা (Admin Only) ---
// URL: PATCH /api/v1/user/update-role/:id
router.patch("/update-role/:id", verifyToken, verifyAdmin, updateUserRole);

// --- ৮. অন্য ইউজারকে ডিলিট করা (Admin Only) ---
// URL: DELETE /api/v1/user/admin-delete/:id
router.delete("/admin-delete/:id", verifyToken, verifyAdmin, adminDeleteUser);

module.exports = router;
