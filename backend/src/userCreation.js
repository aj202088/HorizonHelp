//Packages
const mongoose = require("mongoose")
const connect = mongoose.connect("mongodb+srv://hayleezuba:SASHCORP@horizonhelp.vld24.mongodb.net/")

//Check for db connection
connect.then(() =>{
    console.log("Database successfully connected");
}).catch(() => {
    console.log("Database did not connect");
})

//Create a schema that account info will follow
const LoginSchema =  new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

//Create new mongoose model
const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;