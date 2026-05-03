const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    // status: 'pending' (User side) or 'approved' (Admin side)
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
