const { MongoClient } = require("mongodb");

// MongoDB URI
const uri = "mongodb+srv://admin-test:3EGJfHM4cqg9KQfN@horizonhelp.vld24.mongodb.net/HorizonHelp?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Database Name
const dbName = "HorizonHelp";

let db;
// Connect to the MongoDB cluster
module.exports = {
  connectToServer: async function() {
    try {
      await client.connect();
      console.log("Connected successfully to MongoDB");
      db = client.db(dbName);
      return db;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  },
  
  getDb: function() {
    return db;
  }
};
