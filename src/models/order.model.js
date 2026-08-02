const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, default: "pending" },
    adminMessage: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalPrice: { type: Number },
    issueDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
  },
  { timestamps: true, collection: "orders" }
);

module.exports = mongoose.model("Order", orderSchema);
