const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
  getFlashSale,
} = require("../controllers/product.controller");

router.get("/", getProducts);
router.post("/", addProduct);
router.get("/flash-sale", getFlashSale);
router.get("/:id", getProductById);

module.exports = router;
