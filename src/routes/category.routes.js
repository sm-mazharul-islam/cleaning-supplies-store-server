const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

router.post("/add", categoryController.createCategory);
router.get("/all", categoryController.getAllCategories);
router.patch("/edit/:id", categoryController.updateCategory);
router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = router;
