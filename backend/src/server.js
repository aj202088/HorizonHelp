//  Currently our MongoDB setup
const connect = require("./connect")

// Packages
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./userCreation");

// Creating express application
const app = express()
// Our current port for backend
const PORT = 5000

// MiddleWare
// Tells express how to handle sharing resources accross different domains (such as hosting on 2 different ports from frontend to backend)
app.use(cors())
// Tells express to parse requests in json format
app.use(express.json())

// Connect to MongoDB
connect.connectToServer();

//  Signs the user up for an account
app.post("/api/register", async (req, res) => {

    const data = {
        email: req.body.email,
        password: req.body.password
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ email: data.email });

    if (existingUser) {
        // User already exists, return json error code 400
        return res.status(400).json({success: false, message: "Error: Email is already registered."})
    } else {
        try {
            // Create a new user
            // Hash the password using bcrypt
            const saltRounds = 10; // Number of salt rounds for bcrypt
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword; // Replace the original password with the hashed one

            // Save new user to DB
            const newUser = new collection({email, password});
            await newUser.save();

            // Return successful json code
            res.status(201).json({success: true, message: "Registration successful!"});
        } catch (err) {
            // Log console error and return json internal server error code to frontend
            console.error('Registration error');
            res.status(500).json({sucess: false, message: "Internal server error."});
        }
    } 
});

//Log in user
app.post("/Login", async (req, res) => {
    try {
        // Verify the user exists
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            // Return json error code 400 to frontend
            res.status(400).json({sucess: false, message: "User not found."});
        }
        // Compare the hashed password from the database with the given password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            // User has inputted wrong password
            res.status(400).json({sucess: false, message: "Incorrect password given."})
        }
        else {
            // User has given correct credentials
            res.json({sucess: true, message: "Success!"});
        }
    }
    catch {
        // Internal server error
        console.error('Login Error')
        res.status(500).json({sucess: false, message: "Interna; server error"});
    }
});


// Creates our server to listen to requests on port 3000
app.listen(PORT, () => {
    // Connect to server function still needs to be made in connect.js, thus line below calls connectToServer function
    connect.connectToServer()
    console.log(`Server is running on port ${PORT}`)
})