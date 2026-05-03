const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancelled"],
      default: "Pending",
    },
    issueDate: { type: Date, default: Date.now }, // Set when order is placed
    deliveryDate: { type: Date }, // Set when status is changed to 'Delivered'
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
