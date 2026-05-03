const express = require("express");
const cors = require("cors");

// রাউট ইমপোর্ট সেকশন
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const testimonialRoutes = require("./routes/testimonial.routes");
const commentRoutes = require("./routes/comment.routes");
// নিশ্চিত করুন যে আপনার ফাইলটির নাম user.route.js এবং সেটি routes ফোল্ডারে আছে
const userRoutes = require("./routes/user.routes");

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/comments", commentRoutes);
// ইউজার প্রোফাইল এবং সিঙ্ক এর জন্য এই রুটটি কাজ করবে
app.use("/api/v1/user", userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Besa Luxury Rental API",
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

module.exports = app;
