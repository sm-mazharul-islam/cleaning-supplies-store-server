const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    iconName: { type: String },
    gradient: { type: String, default: "from-blue-600/10 to-transparent" },
    count: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "categories" }
);

module.exports = mongoose.model("Category", categorySchema);
