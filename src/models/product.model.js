const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String },
    name: { type: String },
    image: { type: String },
    description: { type: String },
    category: { type: String },
    brand: { type: String },
    salePrice: { type: Number },
    regularPrice: { type: Number },
    flashSale: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "products" }
);

module.exports = mongoose.model("Product", productSchema);
