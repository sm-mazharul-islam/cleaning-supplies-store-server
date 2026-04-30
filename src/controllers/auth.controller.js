const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../config/db");

// ১. রেজিস্ট্রেশন কন্ট্রোলার (Manual Email/Password)
const register = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { userName, pictureUrl, email, password } = req.body;

    // ভ্যালিডেশন
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password required" });
    }

    // ইউজার অলরেডি আছে কিনা চেক করা
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await collection.insertOne({
      userName,
      pictureUrl,
      email,
      password: hashedPassword,
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

// ২. লগইন কন্ট্রোলার (Manual Email/Password)
const login = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { email, password } = req.body;

    // ইউজার খুঁজে বের করা
    const user = await collection.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // পাসওয়ার্ড চেক করা
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // টোকেন জেনারেট করা
    const token = jwt.sign(
      {
        email: user.email,
        userName: user.userName,
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

// ৩. ফায়ারবেস ইউজার সিঙ্ক কন্ট্রোলার (Upsert)
const syncUser = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { uid, userName, email, pictureUrl } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Upsert: থাকলে আপডেট করবে, না থাকলে ক্রিয়েট করবে
    await collection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          uid,
          userName,
          pictureUrl,
          lastLogin: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );

    // টোকেন জেনারেট
    const token = jwt.sign(
      {
        email: email,
        userName: userName,
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

// ফাংশনগুলো এক্সপোর্ট করা
module.exports = {
  register,
  login,
  syncUser,
};
