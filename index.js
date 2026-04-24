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

    res
      .status(201)
      .json({
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

    const token = jwt.sign(
      {
        email: user.email,
        userName: user.userName,
        pictureUrl: user.pictureUrl || "",
      },
      process.env.JWT_SECRET,
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
    const collection = db.collection("products");

    let query = {};
    if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };

    const products = await collection.find(query).toArray();
    let filtered = products;

    if (brand)
      filtered = filtered.filter((p) => brand.split(",").includes(p.brand));
    if (rating)
      filtered = filtered.filter((p) =>
        rating.split(",").map(Number).includes(Math.floor(p.rating)),
      );
    if (salePrice) {
      const ranges = salePrice.split(",").map((r) => r.split("-").map(Number));
      filtered = filtered.filter((p) =>
        ranges.some(([min, max]) => p.salePrice >= min && p.salePrice <= max),
      );
    }

    const result = filtered.slice((page - 1) * limit, page * limit);
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

// --- Vercel Export ---
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Server running on port 5000"));
}
