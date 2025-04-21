// New approach justu sing mongoclient
const { MongoClient } = require('mongodb');

// Connection string
const uri = "mongodb+srv://test-admin:3EGJfHM4cqg9KQfN@horizonhelp.zuvsx.mongodb.net/";

// Global client and db variables
let client;
let db;

const connectToServer = async function() {
  try {
      // Create a new client
      client = new MongoClient(uri);

      // Connect to the MongoDB cluster
      await client.connect();
      
      // Select the database
      db = client.db("horizonhelp");

      // Removes notifications after 7 days once signed in
      await db.collection("incidents").createIndex(
        { timestamp: 1 },
        // 7 days in seconds is 604800
        { expireAfterSeconds: 604800 }
      );
      // define 2dsphere index for locations
      db.collection("incidents").createIndex({ location: "2dsphere" })

      
      console.log("Successfully connected to MongoDB");
      return db;
  } 
  catch (err) {
      console.error("Failed to connect to MongoDB", err);
      throw err;
  }
};

// Get the database
const getDB = () => {
  if (!db) {
    // Debugging error
      throw new Error("Database not found.");
  }
  return db;
};

// Close connection once done
const closeConnection = async () => {
  if (client) {
      await client.close();
      console.log("Connection closed");
  }
};

module.exports = {
  connectToServer,
  getDB,
  closeConnection
};