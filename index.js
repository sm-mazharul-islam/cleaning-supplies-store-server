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
    // const ourRecentWorksCollection = db.collection("ourRecentlyWorks");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { userName, pictureUrl, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({
        userName,
        pictureUrl,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ======================================================
    // WRITE YOUR CODE HERE

    // app.get("/our-recent-works", async (req, res) => {
    //   // let query = {};
    //   // if (req.query.priority) {
    //   //   query.priority = req.query.priority;
    //   // }
    //   const cursor = ourRecentWorksCollection.find({});
    //   const ourRecentWorksFile = await cursor.toArray();
    //   res.send({ status: true, data: ourRecentWorksFile });
    // });
    app.get("/flash-sale", async (req, res) => {
      // let query = {};
      // if (req.query.priority) {
      //   query.priority = req.query.priority;
      // }
      const cursor = cleaningSuppliesStoreCollection.find({});
      const flashSaleFile = await cursor.toArray();
      res.send({ status: true, data: flashSaleFile });
    });

    //! Here is my older code --->
    // app.get("/products", async (req, res) => {
    //   // let query = {};
    //   // if (req.query.priority) {
    //   //   query.priority = req.query.priority;
    //   // }
    //   const cursor = productStoreCollection.find({});
    //   const productsFile = await cursor.toArray();
    //   res.send({ status: true, data: productsFile });
    // });
    //!--------------!

    // app.get("/products", async (req, res) => {
    //   const { brand, rating, salePrice } = req.query;
    //   console.log("Received query parameters:", { brand, rating, salePrice });

    //   try {
    //     const cursor = productStoreCollection.find({});
    //     let products = await cursor.toArray();

    //     if (brand) {
    //       const brandArray = brand.split(",");
    //       products = products.filter((product) =>
    //         brandArray.includes(product.brand)
    //       );
    //       console.log("Filtered by brand:", products);
    //     }

    //     if (rating) {
    //       const ratingArray = rating.split(",").map(Number);
    //       products = products.filter((product) =>
    //         ratingArray.includes(Math.floor(product.rating))
    //       );
    //       console.log("Filtered by rating:", products);
    //     }

    //     if (salePrice) {
    //       const priceArray = salePrice
    //         .split(",")
    //         .map((range) => range.split("-").map(Number));
    //       products = products.filter((product) => {
    //         return priceArray.some(
    //           ([min, max]) =>
    //             product.salePrice >= min && product.salePrice <= max
    //         );
    //       });
    //       console.log("Filtered by salePrice:", products);
    //     }

    //     res.json({ data: products });
    //   } catch (error) {
    //     console.error("Error fetching products:", error);
    //     res.status(500).send("Internal Server Error");
    //   }
    // });

    //!
    // app.get("/products", async (req, res) => {
    //   const { brand, rating, salePrice, page = 1, limit = 10 } = req.query;
    //   console.log("Received query parameters:", {
    //     brand,
    //     rating,
    //     salePrice,
    //     page,
    //     limit,
    //   });

    //   // Convert page and limit to integers
    //   const pageInt = parseInt(page);
    //   const limitInt = parseInt(limit);

    //   const cursor = productStoreCollection.find({});
    //   const productsFile = await cursor.toArray();

    //   let filteredProducts = productsFile;

    //   if (brand) {
    //     const brandArray = brand.split(",");
    //     filteredProducts = filteredProducts.filter((product) =>
    //       brandArray.includes(product.brand)
    //     );
    //     console.log("Filtered by brand:", filteredProducts);
    //   }

    //   if (rating) {
    //     const ratingArray = rating.split(",").map(Number);
    //     filteredProducts = filteredProducts.filter((product) =>
    //       ratingArray.includes(Math.floor(product.rating))
    //     );
    //     console.log("Filtered by rating:", filteredProducts);
    //   }

    //   if (salePrice) {
    //     const priceArray = salePrice
    //       .split(",")
    //       .map((range) => range.split("-").map(Number));
    //     filteredProducts = filteredProducts.filter((product) => {
    //       return priceArray.some(
    //         ([min, max]) => product.salePrice >= min && product.salePrice <= max
    //       );
    //     });
    //     console.log("Filtered by salePrice:", filteredProducts);
    //   }

    //   // Pagination
    //   const startIndex = (pageInt - 1) * limitInt;
    //   const endIndex = startIndex + limitInt;
    //   const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    //   res.json({ data: paginatedProducts, total: filteredProducts.length });
    // });
    //!

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
          brandArray.includes(product.brand)
        );
        console.log("Filtered by brand:", filteredProducts);
      }

      if (rating) {
        const ratingArray = rating.split(",").map(Number);
        filteredProducts = filteredProducts.filter((product) =>
          ratingArray.includes(Math.floor(product.rating))
        );
        console.log("Filtered by rating:", filteredProducts);
      }

      if (salePrice) {
        const priceArray = salePrice
          .split(",")
          .map((range) => range.split("-").map(Number));
        filteredProducts = filteredProducts.filter((product) => {
          return priceArray.some(
            ([min, max]) => product.salePrice >= min && product.salePrice <= max
          );
        });
        console.log("Filtered by salePrice:", filteredProducts);
      }

      if (searchQuery) {
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log("Filtered by searchQuery:", filteredProducts);
      }

      const startIndex = (pageInt - 1) * limitInt;
      const endIndex = startIndex + limitInt;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      res.json({ data: paginatedProducts, total: filteredProducts.length });
    });

    // app.get("/flash-sale/:_id", async (req, res) => {
    //   const id = req.params._id;
    //   console.log("getting specific service", id);
    //   const query = { _id: id };
    //   const supplies = await cleaningSuppliesStoreCollection.findOne(query);
    //   res.json(supplies);
    // });
    // app.post("/relief-goods", async (req, res) => {
    //   const reliefGoods = req.body;
    //   const result = await reliefGoodsCollection.insertOne(reliefGoods);
    //   res.send(result);
    // });

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
