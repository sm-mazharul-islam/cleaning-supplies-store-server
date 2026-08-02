const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const testimonialRoutes = require("./routes/testimonial.routes");
const commentRoutes = require("./routes/comment.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cleaning Supplies Store API",
    status: "Active",
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Requested URL Not Found",
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
