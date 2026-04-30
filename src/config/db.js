const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  const db = client.db("cleaning-supplies-store");

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

module.exports = connectToDatabase;
