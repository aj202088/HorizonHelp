import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link for routing

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5750/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        console.log("Login successful:", data);
        // Store user email to access it on the dashboard
        localStorage.setItem("userEmail", data.user.email);
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Login Section */}
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>

          {/* Register Link */}
          <p style={styles.registerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.registerLink}>Register here</Link>
          </p>
        </form>
      </div>

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>Welcome to HorizonHelp</h1>
        <p style={styles.welcomeText}>
          Your go-to platform for fire alerts, safety tracking, and first responder coordination.
        </p>
        <p style={styles.welcomeSubtext}>Stay informed. Stay safe. Stay connected.</p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#1e1e1e",
  },
  card: {
    flex: 1,
    backgroundColor: "#2c2c2c",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "#fff",
    maxWidth: "350px",
    marginLeft: "8%",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
    backgroundColor: "#3c3c3c",
    color: "#fff",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#61dafb",
    color: "#222",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  registerText: {
    fontSize: "14px",
    color: "#ccc",
    marginTop: "10px",
  },
  registerLink: {
    color: "#61dafb",
    textDecoration: "underline",
    cursor: "pointer",
  },
  welcomeSection: {
    flex: 2,
    padding: "60px",
    color: "#fff",
    textAlign: "left",
    maxWidth: "600px",
  },
  welcomeTitle: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  welcomeText: {
    fontSize: "20px",
    color: "#ddd",
    maxWidth: "500px",
  },
  welcomeSubtext: {
    fontSize: "16px",
    color: "#aaa",
    marginTop: "15px",
    fontStyle: "italic",
  },
};

export default Login;