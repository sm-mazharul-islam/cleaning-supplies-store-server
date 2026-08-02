const Category = require("../models/category.model");

exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const result = await Category.create(categoryData);
    res.status(201).json({
      success: true,
      message: "Category added successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const result = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, ...updateData } = req.body;

    const result = await Category.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: "No category found with this ID" });
    }

    res.status(200).json({ success: true, message: "Module Configuration Updated!", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "No category found" });
    }
    res.status(200).json({ success: true, message: "Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
