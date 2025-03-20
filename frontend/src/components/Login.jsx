import React, { useState } from "react"; // Import React and the useState hook

// Define the Login component
const Login = () => {
    // useState hooks to manage email and password input states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Function that runs when the form is submitted
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the default form submission behavior (which reloads the page)

        console.log("Logging in with:", { email, password });

        // TODO: Connect this function to the backend authentication API
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={styles.form}>

                {/* Email Input Field */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Updates the state when user types
                    required
                    style={styles.input}
                />

                {/* Password Input Field */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Updates the state when user types
                    required
                    style={styles.input}
                />

                {/* Submit Button */}
                <button type="submit" style={styles.button}>Login</button>

            </form>
        </div>
    );
};

// Inline CSS styles for better UI (optional, can be moved to a CSS file)
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Makes the form centered vertically
        backgroundColor: "#222", // Dark background
        color: "#fff", // White text color
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px", // Adds spacing between input fields
        width: "300px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#61dafb", // Light blue color for React theme
        color: "#222",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

// Export the Login component so it can be used in other files
export default Login;
