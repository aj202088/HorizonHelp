// Packages
const express = require("express");
const cors = require("cors");
const connect = require("./connect")
const bcrypt = require("bcrypt");
const userCollection = require("./userCreation");
const { ObjectId } = require("mongodb");
const { isAdmin } = require("./Middleware/auth");

// Creating express application
const app = express()
// Our current port for backend
const PORT = 5750

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connect.connectToServer()
    .then(() => {
        console.log("Connected successfully to MongoDB");
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
    });

// Register endpoint
app.post("/api/register", async (req, res) => {
    // Get the user data
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin,
        isAdminApproved: req.body.isAdminApproved,
        notifications: req.body.notifications
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
        const check = await userCollection.findOne({ email: req.body.email });
        if (!check) {
            return res.status(400).json({ success: false, message: "User not found." });
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password given." });
        }
        // Destructure approvedAdmin and return it (instead of an undefined isAdmin)
        const { name, email, approvedAdmin, street, city, state, zip, country, notifications } = check;
        res.json({ 
            success: true, 
            message: "Success!", 
            user: { name, email, approvedAdmin, street, city, state, zip, country, notifications } 
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// GET endpoint to fetch user details by email
app.get("/user", async (req, res) => {
    // Extract email from query params
    const email = req.query.email;
    // If email is not provided in request, return 400 bad request
    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" });
    }
    try {
        // Try to find user in db using email
        const user = await userCollection.findOne({ email });
        // If no suer found, return 404 not found
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Return needed data excluding PW for safety
        const { name, phone, street, city, state, zip, country, isAdmin, notifications, email: userEmail } = user;
        res.json({ success: true, user: { name, email: userEmail, phone, street, city, state, zip, country, isAdmin, notifications } });
    } 
    // Catch/log unexpected server errors
    catch (err) {
        console.error("User fetch error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Post endpoint for admin to send notifications to all users in a specific city
app.post("/notifications/admin-broadcast", async (req, res) => {
    const { adminEmail, message, city } = req.body;

    // Input validation
    if (!adminEmail || !message || !city) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        // Access the db and relevant collections
        const db = connect.getDB();
        const usersCollection = db.collection("users");
        const notificationsCollection = db.collection("notifications");

        // Check to see if sender is admin since only admins are allowed to send these broadcasts
        const admin = await usersCollection.findOne({ email: adminEmail });
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ success: false, message: "Admins only."});
        }

        // Find all users in the target city
        const recipients = await usersCollection.find({ city: { $regex: city, $options: "i" }}).toArray();
        const recipientIds = recipients.map(user => user._id)

        // Create and store in-app notification
        await notificationsCollection.insertOne({
            type: "admin-broadcast",
            message,
            from: admin._id,
            to: recipientIds,
            city,
            readBy:[],
            createdAt: new Date()
        });
        // Notification was sent successfully
        res.json({ success: true, message: "Notification sent to users in specified city."});
    }
    catch (err) {
        // Catch/log unexpected server errors
        console.error("Admin broadcast error: ", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    
});

// Post endpoint for user to send message to all admins in that city they have on their account
app.post("/notifications/user-alert", async (req, res) => {
    const { userEmail, message } = req.body;

    // Input validation
    if (!userEmail || !message) {
        return res.status(400).json({ success: false, message: "Email and message are required." });
    }

    try {
        // Access the db and relevant collections
        const db = connect.getDB();
        const usersCollection = db.collection("users");
        const notificationsCollection = db.collection("notifications");

        // Find sender's user profile
        const user = await usersCollection.findOne({ email: userEmail });
        const city = user.city;

        // Find all admins in same city with case-insensitivity handling
        const adminsInCity = await usersCollection.find({
            isAdmin: true,
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).toArray();

        const adminIds = adminsInCity.map(admin => admin._id);

        // Store the user's alert to the admins in the db
        await notificationsCollection.insertOne({
            type: "user-alert",
            message,
            from: user._id,
            to: adminIds,
            readBy: [],
            createdAt: new Date()
        });
        // Notification was sent successfully
        res.json({ success: true, message: `Message sent to admins in ${city}.` });
    } 
    catch (err) {
        // Catch/log unexpected server errors
        console.error("User alert error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get endpoint to retrieve all in-app notifications for a specific user
app.get("/notifications/:userId", async (req, res) => {
    const { userId } = req.params;

    // Input Validation
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required." });
    }

    try {
        // Access the db and relevant collections
        const db = connect.getDB();
        const notificationsCollection = db.collection("notifications");

        // Find all notifications where the user is a recipient
        const messages = await notificationsCollection
            .find({ to: { $in: [ObjectId(userId)] } })
            // Show most recent notifications first and in order
            .sort({ createdAt: -1 })
            .toArray();

        // Notification was sent successfully
        res.json({ success: true, messages });
    } 
    catch (err) {
        // Catch/log unexpected server errors
        console.error("Fetch notifications error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
// This endpoint is used to check if a user is an admin and approved admin
app.get("/api/admin-status", async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email required." });
    }
    try {
        const db = connect.getDB();
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Return the approvedAdmin flag as isApprovedAdmin
        res.json({
            success: true,
            isApprovedAdmin: Boolean(user.approvedAdmin)
        });
    } catch (err) {
        console.error("Error fetching admin status:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
// Endpoint to approve a pending admin request
app.get("/api/pending-admins", async (req, res) => {
    try {
        const db = connect.getDB();
        // Use the correct keys: pendingAdmin and approvedAdmin
        const pendingAdmins = await db.collection('users')
            .find({ pendingAdmin: true, approvedAdmin: false })
            .toArray();
        res.json({ success: true, pendingAdmins });
    } catch (err) {
        console.error("Error fetching pending admins:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

app.get("/api/users-count", async (req, res) => {
    try {
      const db = connect.getDB();
      const count = await db.collection("users").countDocuments();
      res.json({ success: true, count });
    } catch (err) {
      console.error("Error fetching users count:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  });

  app.get("/api/alerts-sent", async (req, res) => {
    try {
      const db = connect.getDB();
      const count = await db.collection("notifications").countDocuments({ type: "admin-broadcast" });
      res.json({ success: true, count });
    } catch (err) {
      console.error("Error fetching alerts count:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  });

// Creates our server to listen to requests on port 5750
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});