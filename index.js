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

// --- MongoDB Connection Cache (Serverless এর জন্য অত্যন্ত জরুরি) ---
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
    connectTimeoutMS: 15000, // ১৫ সেকেন্ড টাইমআউট
  });

  await client.connect();
  const db = client.db("cleaning-supplies-store");

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// --- API Routes (একটিও বাদ নেই) ---

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
        .json({
          success: false,
          message: "User already exists with this email",
        });
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
        message: "User registered successfully",
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
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
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

// 4. Create Comment
app.post("/api/v1/comments", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { userName, pictureUrl, comment, productId } = req.body;
    const newComment = {
      userName,
      pictureUrl: pictureUrl || "",
      comment,
      productId: new ObjectId(productId),
      replies: [],
      createdAt: new Date(),
      isDeleted: false,
    };
    const result = await db.collection("comments").insertOne(newComment);
    res
      .status(201)
      .send({ success: true, data: { ...newComment, _id: result.insertedId } });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// 5. Get Comments by Product ID
app.get("/api/v1/comments/:productId", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const query = {
      productId: new ObjectId(req.params.productId),
      isDeleted: false,
    };
    const result = await db
      .collection("comments")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.send({ success: true, data: result });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// 6. Add Reply to Comment
app.patch("/api/v1/comments/reply/:commentId", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { userName, pictureUrl, comment } = req.body;
    const newReply = {
      replyId: new ObjectId(),
      userName,
      pictureUrl,
      comment,
      createdAt: new Date(),
    };
    const result = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(req.params.commentId) },
        { $push: { replies: newReply } },
      );
    res.send({ success: true, message: "Reply added", data: newReply });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// 7. Get All Flash Sales
app.get("/flash-sale", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("flash-sale").find({}).toArray();
    res.send({ status: true, data: result });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});

// 8. Get Specific Flash Sale Product
app.get("/flash-sale/:id", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("flash-sale")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!result)
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    res.send({ status: true, data: result });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});

// 9. Get All Products (with Pagination & Filter)
app.get("/products", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    let {
      brand,
      rating,
      salePrice,
      page = 1,
      limit = 10,
      searchQuery,
    } = req.query;
    let query = {};
    if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };

    const products = await db.collection("products").find(query).toArray();
    let filtered = products;

    if (brand)
      filtered = filtered.filter((p) => brand.split(",").includes(p.brand));
    if (rating)
      filtered = filtered.filter((p) =>
        rating.split(",").map(Number).includes(Math.floor(p.rating)),
      );
    if (salePrice) {
      const priceRanges = salePrice
        .split(",")
        .map((r) => r.split("-").map(Number));
      filtered = filtered.filter((p) =>
        priceRanges.some(
          ([min, max]) => p.salePrice >= min && p.salePrice <= max,
        ),
      );
    }

    const total = filtered.length;
    const result = filtered.slice((page - 1) * limit, page * limit);
    res.json({ data: result, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 10. Get Specific Product
app.get("/products/:id", async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// --- Server Export (Vercel) ---
module.exports = app;

// Local Development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
