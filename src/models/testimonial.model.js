const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    userId: { type: String },
    userName: { type: String, required: true },
    userImage: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
  },
  { timestamps: true, collection: "testimonials" }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
