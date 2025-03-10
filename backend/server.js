//  Currently our MongoDB setup
const connect = require("./connect")

// Packages
const express = require("express")
const cors = require("cors")

// Creating express application
const app = express()
// Our current port for backend
const PORT = 3000

// MiddleWare
// Tells express how to handle sharing resources accross different domains (such as hosting on 2 different ports from frontend to backend)
app.use(cors())
// Tells express to parse requests in json format
app.use(express.json())

// Creates our server to listen to requests on port 3000
app.listen(PORT, () => {
    // Connect to server function still needs to be made in connect.js, thus line below calls connectToServer function
    connect.connectToServer()
    console.log(`Server is running on port ${PORT}`)
})