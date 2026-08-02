const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return { client: mongoose.connection.client, db: mongoose.connection.db };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  await mongoose.connect(uri, {
    dbName: "cleaning-supplies-store",
  });

  isConnected = true;
  return { client: mongoose.connection.client, db: mongoose.connection.db };
}

module.exports = connectToDatabase;
