const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const syncUser = async (req, res) => {
  try {
    const { uid, userName, email, pictureUrl } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { uid, userName, pictureUrl, lastLogin: new Date(), role: "Customer" } },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      { email: user.email, userName: user.userName, pictureUrl: user.pictureUrl || "", role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, message: "User synced successfully", token, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userName, pictureUrl, phone, address } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: { userName, pictureUrl, phone, address } },
      { new: true }
    );

    const token = jwt.sign(
      { email: updatedUser.email, userName: updatedUser.userName, pictureUrl: updatedUser.pictureUrl, role: updatedUser.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const result = await User.deleteOne({ email: req.user.email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found or already deleted" });
    }
    res.status(200).json({ success: true, message: "User profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  res.status(200).json({ success: true, message: "Login feature is currently handled via /sync" });
};

module.exports = { syncUser, getProfile, updateProfile, deleteProfile, login };
