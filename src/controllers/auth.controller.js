const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../config/db");

// ১. রেজিস্ট্রেশন কন্ট্রোলার
const register = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");

    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { userName, pictureUrl, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password required" });
    }

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ডিফল্টভাবে role: "user" যোগ করা হয়েছে
    const result = await collection.insertOne({
      userName,
      pictureUrl,
      email,
      password: hashedPassword,
      role: "user", // Default Role
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "User registered",
      userId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ২. লগইন কন্ট্রোলার
const login = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");

    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;

    const user = await collection.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // টোকেনের ভেতরে role: user.role যোগ করা হয়েছে
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role || "user", // Role included
        pictureUrl: user.pictureUrl || "",
      },
      process.env.JWT_SECRET || "fallback_secret_for_dev",
      { expiresIn: process.env.EXPIRES_IN || "7d" },
    );

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ৩. ফায়ারবেস ইউজার সিঙ্ক কন্ট্রোলার
const syncUser = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");

    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const { uid, userName, pictureUrl } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // ইউজার খুঁজে দেখা
    const existingUser = await collection.findOne({ email });

    const updatedUser = await collection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          uid,
          userName,
          pictureUrl,
          lastLogin: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          role: "user", // নতুন সিঙ্ক হওয়া ইউজারের জন্য ডিফল্ট রোল
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const finalUser = updatedUser.value || updatedUser;

    // টোকেনে ইউজার ডাটা এবং রোল পাঠানো হচ্ছে
    const token = jwt.sign(
      {
        email: email,
        userName: userName,
        role: finalUser?.role || "user", // Role included from DB
        pictureUrl: pictureUrl || "",
      },
      process.env.JWT_SECRET || "fallback_secret_for_dev",
      { expiresIn: process.env.EXPIRES_IN || "7d" },
    );

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, syncUser };
