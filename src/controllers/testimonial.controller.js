const connectToDatabase = require("../config/db");

// ---  (POST) ---
exports.createTestimonial = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const TestimonialCollection = db.collection("testimonials");

    const { comment, rating } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User context missing",
      });
    }

    const newTestimonial = {
      comment,
      rating: Number(rating),
      userId: req.user.id || req.user._id,
      userName: req.user.userName,
      userImage: req.user.pictureUrl || "",
      createdAt: new Date(),
    };

    const result = await TestimonialCollection.insertOne(newTestimonial);

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      data: { ...newTestimonial, _id: result.insertedId },
    });
  } catch (error) {
    console.error("🔥 Testimonial Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  (GET) ---
exports.getTestimonials = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    //(Sorting)
    const result = await db
      .collection("testimonials")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
