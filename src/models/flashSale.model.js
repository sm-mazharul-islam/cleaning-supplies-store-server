const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String },
    description: { type: String },
    category: { type: String },
    salePrice: { type: Number },
    regularPrice: { type: Number },
  },
  { timestamps: true, collection: "flash-sale" }
);

module.exports = mongoose.model("FlashSale", flashSaleSchema);
