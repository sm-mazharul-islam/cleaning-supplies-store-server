const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonial.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", testimonialController.getTestimonials);
router.post("/", verifyToken, testimonialController.createTestimonial);

module.exports = router;
