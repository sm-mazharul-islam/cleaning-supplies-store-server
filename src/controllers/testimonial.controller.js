const Testimonial = require("../models/testimonial.model");

exports.createTestimonial = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const newTestimonial = await Testimonial.create({
      comment,
      rating: Number(rating),
      userId: req.user.id || req.user._id,
      userName: req.user.userName,
      userImage: req.user.pictureUrl || "",
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      data: newTestimonial,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTestimonials = async (req, res) => {
  try {
    const result = await Testimonial.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
