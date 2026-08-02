const Product = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { brand, searchQuery } = req.query;

    let query = {};
    if (searchQuery && searchQuery.trim()) {
      query.$or = [{ title: { $regex: searchQuery, $options: "i" } }, { name: { $regex: searchQuery, $options: "i" } }];
    }
    if (brand && brand.trim() && brand !== "undefined") {
      query.brand = { $in: brand.split(",") };
    }

    const total = await Product.countDocuments(query);
    const result = await Product.find(query).skip(skip).limit(limit);

    res.json({ success: true, data: result, total, currentPage: page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const result = await Product.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.title || !productData.salePrice || !productData.image) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const newProduct = await Product.create({ ...productData, flashSale: productData.flashSale === "true" || productData.flashSale === true });
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;
    if (updateFields.flashSale !== undefined) {
      updateFields.flashSale = updateFields.flashSale === "true" || updateFields.flashSale === true;
    }
    const updatedDoc = await Product.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
    if (!updatedDoc) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Updated successfully", data: updatedDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProductById, addProduct, updateProduct, deleteProduct };
