// New approach using MongoClient, from Mongo Developer codebase examples https://github.com/mongodb-developer/nodejs-quickstart/blob/master/connection.js
const { MongoClient } = require('mongodb');

// Connection string
const uri = "mongodb+srv://test-admin:3EGJfHM4cqg9KQfN@horizonhelp.vld24.mongodb.net/HorizonHelp";

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
      database = client.db("HorizonHelp");
      
      console.log("Successfully connected to MongoDB");
      return database;
  } catch (err) {
      console.error("Failed to connect to MongoDB", err);
      throw err;
  }
};

// Get the database
const getDB = () => {
  if (!database) {
    // Debugging error
      throw new Error("Database not found.");
  }
  return database;
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
