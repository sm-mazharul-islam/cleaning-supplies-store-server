const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.options("*", cors());
app.use(express.json());

// --- MongoDB Connection Cache ---
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  // নিশ্চিত করুন আপনার MongoDB Atlas-এ ডাটাবেসের নাম এটাই কি না
  const db = client.db("cleaning-supplies-store");

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// --- API Routes ---

// 1. Root Route
app.get("/", (req, res) => {
  res.json({ message: "Server is running smoothly", timestamp: new Date() });
});

// 2. Registration Route
app.post("/api/v1/register", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { userName, pictureUrl, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password required" });
    }

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await collection.insertOne({
      userName,
      pictureUrl,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "User registered",
      userId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Login Route
app.post("/api/v1/login", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("user");
    const { email, password } = req.body;

    const user = await collection.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // আপনার লগইন রাউটের ভেতর এই অংশটি চেক করুন
    const token = jwt.sign(
      {
        email: user.email,
        userName: user.userName,
        pictureUrl: user.pictureUrl || "",
      },
      process.env.JWT_SECRET || "fallback_secret_for_dev", // এখানে একটি ডিফল্ট ভ্যালু দিন
      { expiresIn: process.env.EXPIRES_IN || "7d" },
    );

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Products Route (Search, Filter, Pagination)
app.get("/products", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const {
      brand,
      rating,
      salePrice,
      page = 1,
      limit = 10,
      searchQuery,
    } = req.query;

    // মঙ্গোডিবি থেকে সব ডাটা আনা
    const products = await db.collection("products").find({}).toArray();
    let filtered = products;

    // ১. সার্চ ফিল্টার
    if (searchQuery && searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // ২. ব্র্যান্ড ফিল্টার (খালি স্ট্রিং চেক করা হয়েছে)
    if (brand && brand.trim() !== "" && brand !== "undefined") {
      const brandArray = brand.split(",");
      filtered = filtered.filter((p) => brandArray.includes(p.brand));
    }

    // ৩. রেটিং ফিল্টার
    if (rating && rating.trim() !== "" && rating !== "undefined") {
      const ratingArray = rating.split(",").map(Number);
      filtered = filtered.filter((p) =>
        ratingArray.includes(Math.floor(p.rating)),
      );
    }

    // ৪. প্রাইস রেঞ্জ ফিল্টার
    if (salePrice && salePrice.trim() !== "" && salePrice !== "undefined") {
      const ranges = salePrice.split(",").map((r) => r.split("-").map(Number));
      filtered = filtered.filter((p) =>
        ranges.some(([min, max]) => p.salePrice >= min && p.salePrice <= max),
      );
    }

    // ৫. পেজিনেশন
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const startIndex = (p - 1) * l;
    const result = filtered.slice(startIndex, startIndex + l);

    res.json({ data: result, total: filtered.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 5. Flash Sale Route
app.get("/flash-sale", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const data = await db.collection("flash-sale").find({}).toArray();
    res.send({ status: true, data });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// 6. Comments Routes
app.post("/api/v1/comments", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const newComment = {
      ...req.body,
      productId: new ObjectId(req.body.productId),
      createdAt: new Date(),
      replies: [],
      isDeleted: false,
    };
    const result = await db.collection("comments").insertOne(newComment);
    res
      .status(201)
      .send({ success: true, data: { ...newComment, _id: result.insertedId } });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get("/api/v1/comments/:productId", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("comments")
      .find({ productId: new ObjectId(req.params.productId), isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    res.send({ success: true, data: result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// 7. Single Product/Flash-sale Details
app.get("/products/:id", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get("/flash-sale/:id", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("flash-sale")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.send({ status: true, data: result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Backend: index.js
app.patch("/api/v1/comments/reply/:commentId", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { userName, pictureUrl, comment } = req.body;

    const newReply = {
      userName,
      pictureUrl,
      comment,
      createdAt: new Date(),
    };

    // নির্দিষ্ট কমেন্টের replies অ্যারেতে নতুন অবজেক্ট পুশ করা
    const result = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(req.params.commentId) },
        { $push: { replies: newReply } },
      );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ success: false, message: "Comment not found" });
    }

    res.send({ success: true, data: newReply });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// --- Vercel Export ---
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Server running on port 5000"));
}
