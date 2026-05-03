const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const testimonialRoutes = require("./routes/testimonial.routes");
const commentRoutes = require("./routes/comment.routes");

const userRoutes = require("./routes/user.routes");

const app = express();

// Middlewares
const allowedOrigins = [
  "https://cleaning-supplies-store-0.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/comments", commentRoutes);
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
