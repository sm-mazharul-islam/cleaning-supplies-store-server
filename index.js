const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");

require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("cleaning-supplies-store");
    const collection = db.collection("user");
    const cleaningSuppliesStoreCollection = db.collection("flash-sale");
    const productStoreCollection = db.collection("products");
    const commentsCollection = db.collection("comments");

    // 1. POST: Create a new Comment
    // backend/server.js
    app.post("/api/v1/comments", async (req, res) => {
      try {
        // ফ্রন্টএন্ড থেকে আসা 'userName' রিসিভ করা হচ্ছে
        const { userName, pictureUrl, comment, productId } = req.body;

        const newComment = {
          userName, // এখানে বানানটি ডাটাবেজের ফিল্ডের সাথে মিলানো হলো
          pictureUrl: pictureUrl || "",
          comment,
          productId: new ObjectId(productId),
          replies: [],
          createdAt: new Date(),
          isDeleted: false,
        };

        const result = await commentsCollection.insertOne(newComment);
        res.status(201).send({
          success: true,
          data: { ...newComment, _id: result.insertedId },
        });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // 2. GET: Fetch comments for a specific product
    app.get("/api/v1/comments/:productId", async (req, res) => {
      const query = {
        productId: new ObjectId(req.params.productId),
        isDeleted: false,
      };
      const result = await commentsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send({ success: true, data: result });
    });

    // 3. PATCH: Add a reply to an existing comment
    app.patch("/api/v1/comments/reply/:commentId", async (req, res) => {
      try {
        const { userName, pictureUrl, comment } = req.body;
        const commentId = req.params.commentId;

        const newReply = {
          replyId: new ObjectId(), // Unique ID for the reply
          userName,
          pictureUrl,
          comment,
          createdAt: new Date(),
        };

        const filter = { _id: new ObjectId(commentId) };
        const updateDoc = {
          $push: { replies: newReply },
        };

        const result = await commentsCollection.updateOne(filter, updateDoc);
        res.send({ success: true, message: "Reply added", data: newReply });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // User Registration
    // Registration Route
    app.post("/api/v1/register", async (req, res) => {
      try {
        const { userName, pictureUrl, email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
          return res
            .status(400)
            .json({ success: false, message: "Email and Password required" });
        }

        // 2. Check if email already exists
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "User already exists with this email",
          });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert user
        const result = await collection.insertOne({
          userName,
          pictureUrl,
          email,
          password: hashedPassword,
          createdAt: new Date(),
        });

        res.status(201).json({
          success: true,
          message: "User registered successfully",
          userId: result.insertedId,
        });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });
    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // ১. ইমেইল দিয়ে ইউজার খুঁজুন
      const user = await collection.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // ২. পাসওয়ার্ড চেক করুন
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // ৩. JWT টোকেন তৈরি (এখানেই আসল পরিবর্তন)
      // payload-এ userName এবং pictureUrl যোগ করা হলো
      const token = jwt.sign(
        {
          email: user.email,
          userName: user.userName, // ডাটাবেজে আপনার ফিল্ডের নাম যা আছে সেটি লিখুন
          pictureUrl: user.pictureUrl || "", // ছবি না থাকলে খালি স্ট্রিং
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.EXPIRES_IN || "7d",
        },
      );

      // ৪. রেসপন্স পাঠানো
      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    app.get("/flash-sale", async (req, res) => {
      const cursor = cleaningSuppliesStoreCollection.find({});
      const flashSaleFile = await cursor.toArray();
      res.send({ status: true, data: flashSaleFile });
    });

    // একটি নির্দিষ্ট ফ্ল্যাশ সেল প্রোডাক্ট পাওয়ার রাউট
    app.get("/flash-sale/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // MongoDB ID চেক করা (ভুল আইডি দিলে যাতে সার্ভার ক্রাশ না করে)
        const query = { _id: new ObjectId(id) };

        const result = await cleaningSuppliesStoreCollection.findOne(query);

        if (!result) {
          return res
            .status(404)
            .send({ status: false, message: "Product not found" });
        }

        res.send({ status: true, data: result });
      } catch (error) {
        res.status(500).send({
          status: false,
          message: "Internal Server Error",
          error: error.message,
        });
      }
    });

    app.get("/products", async (req, res) => {
      const {
        brand,
        rating,
        salePrice,
        page = 1,
        limit = 10,
        searchQuery,
      } = req.query;
      console.log("Received query parameters:", {
        brand,
        rating,
        salePrice,
        page,
        limit,
        searchQuery,
      });

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);

      const cursor = productStoreCollection.find({});
      const productsFile = await cursor.toArray();

      let filteredProducts = productsFile;

      if (brand) {
        const brandArray = brand.split(",");
        filteredProducts = filteredProducts.filter((product) =>
          brandArray.includes(product.brand),
        );
        console.log("Filtered by brand:", filteredProducts);
      }

      if (rating) {
        const ratingArray = rating.split(",").map(Number);
        filteredProducts = filteredProducts.filter((product) =>
          ratingArray.includes(Math.floor(product.rating)),
        );
        console.log("Filtered by rating:", filteredProducts);
      }

      if (salePrice) {
        const priceArray = salePrice
          .split(",")
          .map((range) => range.split("-").map(Number));
        filteredProducts = filteredProducts.filter((product) => {
          return priceArray.some(
            ([min, max]) =>
              product.salePrice >= min && product.salePrice <= max,
          );
        });
        console.log("Filtered by salePrice:", filteredProducts);
      }

      if (searchQuery) {
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        console.log("Filtered by searchQuery:", filteredProducts);
      }

      const startIndex = (pageInt - 1) * limitInt;
      const endIndex = startIndex + limitInt;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      res.json({ data: paginatedProducts, total: filteredProducts.length });
    });

    app.get("/flash-sale/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const nid = new ObjectId(id);
      const query = { _id: nid };
      const result = await cleaningSuppliesStoreCollection.findOne(query);
      console.log(result);
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const nid = new ObjectId(id);
      const query = { _id: nid };
      const result = await productStoreCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // app.delete("/relief-goods/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const delId = new ObjectId(id);
    //   const delOne = { _id: delId };
    //   const result = await reliefGoodsCollection.deleteOne(delOne);
    //   // console.log(result);
    //   res.send(result);
    // });

    // ==============================================================

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
