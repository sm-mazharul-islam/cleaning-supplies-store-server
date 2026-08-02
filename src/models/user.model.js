const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    pictureUrl: { type: String, default: "" },
    role: { type: String, default: "user" },
    uid: { type: String },
    phone: { type: String },
    address: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true, collection: "user" }
);

module.exports = mongoose.model("User", userSchema);
