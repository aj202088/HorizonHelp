// Packages
const express = require("express");
const cors = require("cors");
const connect = require("./connect")
const bcrypt = require("bcrypt");
const userCollection = require("./userCreation");

// Creating express application
const app = express()
// Our current port for backend
const PORT = 5750

// MiddleWare
// Tells express how to handle sharing resources accross different domains (such as hosting on 2 different ports from frontend to backend)
app.use(cors())
// Tells express to parse requests in json format
app.use(express.json())

// Connect to MongoDB
connect.connectToServer();

//  Signs the user up for an account
app.post("/api/register", async (req, res) => {
    // Get the user data
    const data = {
        email: req.body.email,
        password: req.body.password
    };

    // Hash the password before its placed into mongodb
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;

    try {
        // Check if the emai; already exists in the database
        const existingUser = await userCollection.findOne({ email: data.email });

        if (existingUser) {
            // User already exists, return json error code 400
            return res.status(400).json({ success: false, message: "Error: Email is already registered." });
        } else {
            // Create a new user
            const result = await userCollection.create(data);

            // Return successful json code
            res.status(201).json({ success: true, message: "Registration successful!" });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


//Log in user
app.post("/login", async (req, res) => {
    try {
        // Verify the user exists
        const check = await userCollection.findOne({ email: req.body.email });
        if (!check) {
            // Return json error code 400 to frontend
            res.status(400).json({sucess: false, message: "User not found."});
        }
        // Compare the hashed password from the database with the given password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            // User has inputted wrong password
            res.status(400).json({success: false, message: "Incorrect password given."})
        }
        else {
            // User has given correct credentials
            res.json({success: true, message: "Success!"});
        }
    }
    catch {
        // Internal server error
        console.error('Login Error')
        res.status(500).json({success: false, message: "Internal server error"});
    }
});


// Creates our server to listen to requests on port 5750
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
