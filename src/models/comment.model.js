const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userName: { type: String },
    pictureUrl: { type: String },
    userEmail: { type: String },
    comment: { type: String, required: true },
    replies: { type: Array, default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "comments" }
);

module.exports = mongoose.model("Comment", commentSchema);
