const { getDB } = require('./connect');

// Create collection containing the create function using inputted user data
const userCollection = {
    async create(userData) {
        // Get the existing database
        const db = getDB();
        
        // Get existing collection of users to compare potential new user to
        const collection = db.collection('users');  // 'users' collection

        try {
            // New user schema
            const signupSchema = {
                name: {
                    value: userData.name || "", // optional or required as you prefer
                    required: false
                },
                email: {
                    value: userData.email,
                    required: true,
                    unique: true
                },
                password: {
                    value: userData.password,
                    required: true
                },
                phone: {
                    value: userData.phone || "", // optional
                    required: false
                },
                street: {
                    value: userData.street || "1251 3rd St",
                    required: false
                },
                city: {
                    value: userData.city || "San Francisco",
                    required: false
                },
                state: {
                    value: userData.state || "CA",
                    required: false
                },
                zip: {
                    value: userData.zip || "94158",
                    required: false
                },
                country: {
                    value: userData.country || "USA",
                    required: false
                },
                pendingAdmin: {
                    value: userData.pendingAdmin || false
                },
                approvedAdmin: { 
                    value: false 
                },
                notifications: {
                    value: true
                }
            };

            // Create the new user info
            const userInformation = {
                name: signupSchema.name.value,
                email: signupSchema.email.value,
                password: signupSchema.password.value,
                phone: signupSchema.phone.value,
                street: signupSchema.street.value,
                city: signupSchema.city.value,
                state: signupSchema.state.value,
                zip: signupSchema.zip.value,
                country: signupSchema.country.value,
                pendingAdmin: signupSchema.pendingAdmin.value,
                approvedAdmin: signupSchema.approvedAdmin.value,
                notifications: signupSchema.notifications.value,
            };

            // Insert the new user into the collection
            const result = await collection.insertOne(userInformation);
            
            // Return result(successful/unsuccessful)
            return result;

        } catch (err) {
            console.log(err);
            throw new Error("Error creating user");
        }
    },

    // Check if a user already exists
    async findOne(query) {
        const db = getDB();
        const collection = db.collection('users');
        try {
            const result = await collection.findOne(query);
            return result;
        } catch (err) {
            console.log(err);
            throw new Error("Error finding user");
        }
    }
};

module.exports = userCollection;
