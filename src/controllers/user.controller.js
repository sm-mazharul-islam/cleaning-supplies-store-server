const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../config/db");
const { ObjectId } = require("mongodb");

// --- ১. ইউজার সিঙ্ক (Login/Register via Google or Firebase) ---
const syncUser = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { uid, userName, email, pictureUrl } = req.body;

    const result = await collection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          uid,
          userName,
          pictureUrl,
          lastLogin: new Date(),
          role: "Customer", // ডিফল্ট রোল
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );

    const user = result.value || result;

    const token = jwt.sign(
      {
        email: user.email,
        userName: user.userName,
        pictureUrl: user.pictureUrl || "",
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      token,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ২. প্রোফাইল ডিটেইলস গেট করা ---
const getProfile = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const email = req.user.email;

    const user = await db.collection("user").findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ৩. প্রোফাইল আপডেট করা (Edit Profile) ---
const updateProfile = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const email = req.user.email;
    const { userName, pictureUrl, phone, address } = req.body;

    const result = await db.collection("user").findOneAndUpdate(
      { email: email },
      {
        $set: {
          userName,
          pictureUrl,
          phone,
          address,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    const updatedUser = result.value || result;

    const token = jwt.sign(
      {
        email: updatedUser.email,
        userName: updatedUser.userName,
        pictureUrl: updatedUser.pictureUrl,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ৪. ম্যানুয়াল লগইন ---
const login = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login feature is currently handled via /sync",
  });
};

// --- ৫. নিজের প্রোফাইল ডিলিট করা ---
const deleteProfile = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const email = req.user.email;

    const result = await db.collection("user").deleteOne({ email: email });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN POWERS =================

// --- ৬. সকল ইউজার গেট করা (Admin Only) ---
const getAllUsers = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const users = await db.collection("user").find({}).toArray();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ৭. ইউজারের রোল পরিবর্তন করা (Admin Only) ---
const updateUserRole = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { role } = req.body; // e.g., "admin" or "Customer"

    const result = await db
      .collection("user")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { role, updatedAt: new Date() } },
      );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ৮. অন্য ইউজার ডিলিট করা (Admin Only) ---
const adminDeleteUser = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    const result = await db
      .collection("user")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted by admin successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Exporting all functions
module.exports = {
  syncUser,
  getProfile,
  updateProfile,
  login,
  deleteProfile,
  getAllUsers, // New
  updateUserRole, // New
  adminDeleteUser, // New
};
