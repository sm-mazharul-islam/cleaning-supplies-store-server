const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { syncUser } = require("./auth.sync.controller");

const register = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { userName, pictureUrl, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and Password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ userName, pictureUrl, email, password: hashedPassword, role: "user" });

    res.status(201).json({ success: true, message: "User registered", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userName: user.userName, role: user.role || "user", pictureUrl: user.pictureUrl || "" },
      process.env.JWT_SECRET || "fallback_secret_for_dev",
      { expiresIn: process.env.EXPIRES_IN || "7d" }
    );

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, syncUser };
