// Packages
const express = require("express");
const cors = require("cors");
const connect = require("./connect")
const bcrypt = require("bcrypt");
const userCollection = require("./userCreation");
const { ObjectId } = require("mongodb");
const { isAdmin } = require("./Middleware/auth");
const incidentCollection = require("./incidentCollection");

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
        const { _id, name, phone, street, city, state, zip, country, isAdmin, notifications, email: userEmail } = user;
        res.json({ success: true, user: { _id, name, email: userEmail, phone, street, city, state, zip, country, isAdmin, notifications } });
    } 
    // Catch/log unexpected server errors
    catch (err) {
        console.error("User fetch error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Post endpoint for admin to send notifications to all users in a specific city
app.post("/notifications/admin-broadcast", async (req, res) => {
    const { adminEmail, message, city, severity, radius = 5} = req.body;
    // Access the db and relevant collections
    const db = connect.getDB();
    const usersCollection = db.collection("users");
    const notificationsCollection = db.collection("notifications");

    // Verify user is admin
    const user = await usersCollection.findOne({ email: adminEmail });
    if (!user || !user.approvedAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Find all users in the target city
        const recipients = await usersCollection.find({ city: { $regex: city, $options: "i" }}).toArray();
        const recipientIds = recipients.map(user => user._id)

        // Geocode the city to get coordinates
        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
        );
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            return res.status(400).json({ success: false, message: "Could not geocode city." });
        }

        const lat = parseFloat(geoData[0].lat);
        const lng = parseFloat(geoData[0].lon);

        // Create and store in-app notification
        await notificationsCollection.insertOne({
            type: "admin-broadcast",
            message,
            from: user._id,
            to: recipientIds,
            city,
            severity,
            readBy:[],
            createdAt: new Date()
        });

        // Insert the incident (used for heatmap)
        await db.collection("incidents").insertOne({
            city,
            severity: severity.toLowerCase(),
            radius,
            location: {
            type: "Point",
            coordinates: [lng, lat]
            },
            timestamp: new Date()
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
            resolved: false,
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
            .find({ to: { $in: [new ObjectId(userId)] } })
            // Show most recent notifications first and in order
            .sort({ createdAt: -1 })
            .toArray();

        // Attach sender info to each message
        const senderMessage = await Promise.all(
            messages.map(async (message) => {
                let sender;
                try {
                    sender = await userCollection.findOne({ _id: new ObjectId(String(message.from)) });
                } 
                catch (e) {
                    console.error("Error converting alert.from to ObjectId:", e, message.from);
                }
                return {
                    // Spread all original message fields
                    ...message,
                    sender: sender
                    ? { name: sender.name, email: sender.email }
                    : { name: "Unknown", email: "N/A" },
                    timestamp: new Date(message.createdAt).toLocaleString()
                };
            })
        );
        // Notification was sent successfully
        res.json({ success: true, messages: senderMessage });
    } 
    catch (err) {
        // Catch/log unexpected server errors
        console.error("Fetch notifications error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Put request to handle whether a user alert has been handled or not
app.put("/notifications/resolve/:id", async (req, res) => {
    const db = connect.getDB();
    try {
      const result = await db.collection("notifications").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { resolved: req.body.resolved } }
      );
      res.json({ success: true, updated: result.modifiedCount });
    } catch (err) {
      console.error("Resolve update error:", err);
      res.status(500).json({ success: false });
    }
  });

// Get endpoint to get nearby incidents within a 100 mile radius of a users profile
app.get("/incidents/nearby", async (req, res) => {
    const { lat, lng } = req.query;
    // Make sure there are coordinates 
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Missing coordinates" });
    }
  
    try {
        //
        const incidents = await incidentCollection.getNearbyIncidents(
            parseFloat(lat),
            parseFloat(lng)
        );
  
        // Format incidents before sending
        const formatted = incidents.map((incident) => {
            const [lng, lat] = incident.location.coordinates;
            // Different intensity levels
            const intensity = {
                critical: 0.6,
                high: 0.45, 
                moderate: 0.3,
                low: 0.15
            // Default to low severity
            }[incident.severity?.toLowerCase()] || 0.15;
    
            // Defined radius defaulted to 5 miles
            const radius = incident.radius ? incident.radius * 1609.34 : 1609.34 * 5;
        
            // Exact shape expected by Leaflet.heat
            return [lat, lng, intensity, radius];
        });
        // Locating nearby incidents was done successfully
        res.json({ success: true, points: formatted });
    } 
    catch (err) {
        // Catch/log unexpected server errors
        console.error("Error fetching nearby incidents:", err);
        res.status(500).json({ success: false, message: "Server error" });
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

// GET endpoint to retrieve all user alerts for admins
app.get("/user-alerts", async (req, res) => {
    
    try {
      const db = connect.getDB();
      const notificationsCollection = db.collection("notifications");
      const usersCollection = db.collection("users");
  
      const alerts = await notificationsCollection
        .find({ type: "user-alert" })
        .sort({ createdAt: -1 })
        .toArray();
  
      // Populate sender info for each alert
      const senderMessage = await Promise.all(alerts.map(async (alert) => {
        console.log("Processing alert:", alert);
        // skip invalid ObjectId
        if (!ObjectId.isValid(alert.from)) {
            console.error("Invalid ObjectId in alert.from:", alert.from);
            return null;
        }

        const sender = await usersCollection.findOne({ _id: new ObjectId(String(alert.from)) });
        // Skip if alert is from deleted or invalid user
        if (!sender) {
            console.warn(" Skipping alert — sender not found:", alert.from);
            return null;
        }
        
        return {
          ...alert,
          sender: {
            name: sender.name,
            street: sender.street,
            city: sender.city,
            state: sender.state,
            zip: sender.zip,
            country: sender.country
          }
        };
      }));
      // Remove any null results
        const filtered = senderMessage.filter(alert => alert !== null);
      res.json({ success: true, alerts: filtered });
    } catch (err) {
      console.error("Failed to fetch user alerts:", err);
      res.status(500).json({ success: false, message: "Internal error" });
    }
 });

// Creates our server to listen to requests on port 5750
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});