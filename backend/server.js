//  Currently our MongoDB setup
const connect = require("./connect")

// Packages
const express = require("express");
const cors = require("cors");
const path = require("path");
const crypt = require("bcrypt");
const collection = require("./userCreation");

// Creating express application
const app = express()
// Our current port for backend
const PORT = 3000

// MiddleWare
// Tells express how to handle sharing resources accross different domains (such as hosting on 2 different ports from frontend to backend)
app.use(cors())
// Tells express to parse requests in json format
app.use(express.json())

// Create functionality for login
// Register User, I dont think this has been made yet
app.post("/Signup", async (req, res) => {

    const data = {
        name: req.body.email,
        password: req.body.password
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('Email registered. Use another email or attempt to sign in?');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

});

//Log in user
app.post("/Login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.email });
        if (!check) {
            res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the given password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            res.render("home");
        }
    }
    catch {
        res.send("wrong Details");
    }
});


// Creates our server to listen to requests on port 3000
app.listen(PORT, () => {
    // Connect to server function still needs to be made in connect.js, thus line below calls connectToServer function
    connect.connectToServer()
    console.log(`Server is running on port ${PORT}`)
})