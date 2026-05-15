const connectToDatabase = require("../config/db");
const { ObjectId } = require("mongodb");

// ১. Add New Category
exports.createCategory = async (req, res) => {
  try {
    // ডিস্ট্রাকচার করে db অবজেক্টটি নিন
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection("categories");

    const categoryData = req.body;
    const result = await categoriesCollection.insertOne(categoryData);

    res.status(201).json({
      success: true,
      message: "Category added successfully!",
      data: { ...categoryData, _id: result.insertedId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ২. Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection("categories");
    const result = await categoriesCollection
      .find({})
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    // ১. ObjectId ভ্যালিড কি না চেক করুন
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid MongoDB ID format" });
    }

    // ২. req.body থেকে _id আলাদা করুন (কারণ _id আপডেট করা নিষিদ্ধ)
    const { _id, ...updateData } = req.body;

    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }, // শুধু ডাটা আপডেট হবে, আইডি নয়
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No category found with this ID" });
    }

    res
      .status(200)
      .json({ success: true, message: "Module Configuration Updated!" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
// ৪. Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, message: "Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
