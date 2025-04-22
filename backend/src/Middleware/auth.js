const userCollection = require("../userCreation");

const isAdmin = async (req, res, next) => {
    const email = req.body.email || req.query.email;

    try {
        const user = await userCollection.findOne({ email });
        if (user && user.isAdmin === true) {
            // Attach user info to request for later use
            req.user = user;
            next(); // User is an admin, proceed to the next middleware or route
        } else {
            res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }
    } catch (err) {
        console.error("Authorization error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = { isAdmin };