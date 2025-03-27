const mongoose = require("mongoose");

// Create a schema that account info will follow
const LoginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: true,
    },
});

// Create new mongoose model
const collection = mongoose.model("users", LoginSchema);

module.exports = collection;