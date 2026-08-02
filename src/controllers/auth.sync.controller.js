const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const syncUser = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { uid, userName, pictureUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { uid, userName, pictureUrl, lastLogin: new Date() }, $setOnInsert: { role: "user" } },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      { email, userName, role: updatedUser?.role || "user", pictureUrl: pictureUrl || "" },
      process.env.JWT_SECRET || "fallback_secret_for_dev",
      { expiresIn: process.env.EXPIRES_IN || "7d" }
    );

    res.status(200).json({ success: true, message: "User synced successfully", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { syncUser };
