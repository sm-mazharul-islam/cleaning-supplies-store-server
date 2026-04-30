const { ObjectId } = require("mongodb");
const connectToDatabase = require("../config/db");

// --- Product Logic ---
const getProducts = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { brand, page = 1, limit = 10, searchQuery } = req.query;
    const products = await db.collection("products").find({}).toArray();
    let filtered = products;

    if (searchQuery && searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        (p.title || p.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    if (brand && brand.trim() !== "" && brand !== "undefined") {
      const brandArray = brand.split(",");
      filtered = filtered.filter((p) => brandArray.includes(p.brand));
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const result = filtered.slice(startIndex, startIndex + parseInt(limit));
    res.json({ success: true, data: result, total: filtered.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productData = req.body;
    if (!productData.title || !productData.salePrice || !productData.image) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    const newProduct = { ...productData, createdAt: new Date() };
    const result = await db.collection("products").insertOne(newProduct);
    res
      .status(201)
      .json({ success: true, data: { ...newProduct, _id: result.insertedId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Flash Sale Logic ---
const getFlashSale = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const data = await db.collection("flash-sale").find({}).toArray();
    res.send({ status: true, data });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = { getProducts, getProductById, addProduct, getFlashSale };
