// Redo with Mongodb driver instead of mongoose
const { getDB } = require('./connect');

// Create collection containing the create function using inputted user data
const collection = {
    async create(userData) {
        // Get existing database
        const db = getDB();
        // Get existing collection of users to compare potential new user to
        const existingUser = db.collection('users').findOne(query);
        try {
            // New user schema
            const signupSchema = {
                // Using lowercase trues bc I know js
                email: {
                    type: String,
                    value: userData.email,
                    required: true,
                    unique: true
                },
                password: {
                    type: String,
                    value: userData.password,
                    required: true
                }
            }

            // TODO: implement error throwing when field is missing

            // Create the new user info
            const userInformation = {
                email: signupSchema.email.value
            }

            // Return new user
            return collection.insertOne(userInformation);
            
        } catch (err) {

            // Log any errors that may occur (debugging)
            console.log(err)

        } finally {
            // Close the connection once finished
            await client.close();

        }
    }
};

module.exports = collection;
