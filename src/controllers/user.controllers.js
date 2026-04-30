const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../config/db");

const syncUser = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { uid, userName, email, pictureUrl } = req.body;

    const result = await collection.findOneAndUpdate(
      { email: email },
      {
        $set: { uid, userName, pictureUrl, lastLogin: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );

    const token = jwt.sign(
      { email, userName, pictureUrl: pictureUrl || "" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    res.status(200).json({ success: true, message: "User synced", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { syncUser }; // অন্যান্য ফাংশনগুলোও (login, register) এখানে যোগ করুন
