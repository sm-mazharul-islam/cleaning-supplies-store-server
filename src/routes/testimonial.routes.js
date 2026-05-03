const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonial.controller");

/**
 * Middleware Import
 * Since auth.middleware.js now exports an object, we must destructure
 * to get the specific 'verifyToken' function.
 */
const { verifyToken } = require("../middlewares/auth.middleware");

// --- 1. GET Testimonials (Public Access) ---
// URL: GET /api/v1/testimonials
// Description: Retrieve all client reviews/testimonials
router.get("/", testimonialController.getTestimonials);

// --- 2. POST Testimonial (Authenticated Access) ---
// URL: POST /api/v1/testimonials
// Description: Allows logged-in users to submit a new review
// Security: Uses verifyToken to ensure a valid JWT is present
router.post("/", verifyToken, testimonialController.createTestimonial);

module.exports = router;
