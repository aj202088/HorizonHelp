const mongoose = require("mongoose");

// MongoDB URI
const uri = "mongodb+srv://test-admin:3EGJfHM4cqg9KQfN@horizonhelp.zuvsx.mongodb.net/HorizonHelp?retryWrites=true&w=majority";

module.exports = {
  connectToServer: async function () {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected successfully to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  },
};