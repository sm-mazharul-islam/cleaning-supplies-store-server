const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mongoose এর মাধ্যমে সরাসরি কালেকশন এক্সেস করা
    const User = mongoose.connection.db.collection("user");

    const user = await User.findOne({ email });
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

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role || "user",
        pictureUrl: user.pictureUrl || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: { userName: user.userName, role: user.role || "user" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login };
