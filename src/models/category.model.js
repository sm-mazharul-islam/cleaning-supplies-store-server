const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Slug format (e.g., 'industrial-care')
    name: { type: String, required: true },
    description: { type: String },
    iconName: { type: String, required: true }, // icons/fa থেকে নাম আসবে (e.g., 'FaTools')
    gradient: { type: String, default: "from-blue-600/10 to-transparent" },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
