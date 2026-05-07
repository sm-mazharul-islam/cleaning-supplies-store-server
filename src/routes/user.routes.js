const express = require("express");
const router = express.Router();

const {
  syncUser,
  getProfile,
  updateProfile,
  login,
  deleteProfile,
  getAllUsers,
  updateUserRole,
  adminDeleteUser,
} = require("../controllers/user.controller");

const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

// ================= PUBLIC / AUTH ROUTES =================

// URL: POST /api/v1/user/sync
router.post("/sync", syncUser);

// --- ২. ইউজার লগইন (Manual Login) ---
// URL: POST /api/v1/user/login
router.post("/login", login);

// ============= AUTHENTICATED USER ROUTES ==============

// URL: GET /api/v1/user/profile
router.get("/profile", verifyToken, getProfile);

// URL: PATCH /api/v1/user/profile/update
router.patch("/profile/update", verifyToken, updateProfile);

// URL: DELETE /api/v1/user/profile/delete
router.delete("/profile/delete", verifyToken, deleteProfile);

// ================= ADMIN PRIVILEGED ROUTES =================

// URL: GET /api/v1/user/all-users
router.get("/all-users", verifyToken, verifyAdmin, getAllUsers);

// URL: PATCH /api/v1/user/update-role/:id
router.patch("/update-role/:id", verifyToken, verifyAdmin, updateUserRole);

// URL: DELETE /api/v1/user/admin-delete/:id
router.delete("/admin-delete/:id", verifyToken, verifyAdmin, adminDeleteUser);

module.exports = router;
