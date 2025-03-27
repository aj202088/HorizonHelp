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
                email: {
                    value: userData.email,
                    required: true,
                    unique: true
                },
                password: {
                    value: userData.password,
                    required: true
                }
            };

            // TODO: implement error throwing when field is missing

            // Create the new user info
            const userInformation = {
                email: signupSchema.email.value,
                password: signupSchema.password.value
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
