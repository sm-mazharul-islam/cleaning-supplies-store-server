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

// Public / Auth Routes
router.post("/sync", syncUser);
router.post("/login", login);

// Authenticated User Profile Routes
router.get("/profile", verifyToken, getProfile);
router.patch("/profile/update", verifyToken, updateProfile);
router.delete("/profile/delete", verifyToken, deleteProfile);

// Admin User Management Routes
router.get("/all-users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/update-role/:id", verifyToken, verifyAdmin, updateUserRole);
router.delete("/admin-delete/:id", verifyToken, verifyAdmin, adminDeleteUser);

module.exports = router;
