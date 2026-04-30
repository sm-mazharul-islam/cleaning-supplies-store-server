const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes"); // যেটা আগে তৈরি করেছিলেন
const productRoutes = require("./routes/product.routes");
const commentRoutes = require("./routes/comment.routes");

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Unified Routes
app.use("/api/v1/auth", authRoutes); // register, login, sync
app.use("/api/v1/products", productRoutes); // get, post, flash-sale
app.use("/api/v1/comments", commentRoutes); // get, post, reply

app.get("/", (req, res) => {
  res.json({ message: "Assignment 8 MVC Server", status: "Active" });
});

module.exports = app;
