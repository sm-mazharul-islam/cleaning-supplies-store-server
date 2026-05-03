const app = require("./src/app");
const connectToDatabase = require("./src/config/db");
require("dotenv").config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("⏳ Connecting to Database...");
    // ১. আগে ডাটাবেজ কানেক্ট করুন
    await connectToDatabase();

    // ২. কানেকশন সফল হলে তবেই সার্ভার চালু করুন
    app.listen(port, () => {
      console.log(
        `🚀 Database Connected & Server running on http://localhost:${port}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
