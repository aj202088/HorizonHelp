import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
      {/* Login Card */}
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

          <p style={styles.registerText}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.registerLink}>Register here</Link>
          </p>
        </form>
      </div>

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>
          <span role="img" aria-label="fire">🔥</span>{" "}
          Welcome to <span style={{ color: "#f7971e" }}>HorizonHelp</span>
        </h1>
        <p style={styles.welcomeText}>
          Your go-to platform for <span style={styles.orange}>fire alerts</span>,{" "}
          <span style={styles.orange}>safety tracking</span>, and{" "}
          <span style={styles.orange}>first responder coordination</span>.
        </p>
        <p style={styles.subtext}>Stay informed. Stay safe. Stay connected.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundImage: `url("/forest.jpg")`, // make sure forest.jpg is in public folder
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "2rem",
    gap: "4rem",
  },
  card: {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: "12px",
    padding: "3rem",
    color: "white",
    maxWidth: "350px",
    width: "100%",
    boxShadow: "0 0 30px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2c2c2c",
    color: "#fff",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#f7971e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  registerText: {
    fontSize: "14px",
    textAlign: "center",
    color: "#ccc",
    marginTop: "0.5rem",
  },
  registerLink: {
    color: "#f7971e",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  welcomeSection: {
    flex: 1,
    color: "white",
    maxWidth: "600px",
    textShadow: "1px 1px 4px #000",
  },
  welcomeTitle: {
    fontSize: "42px",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  welcomeText: {
    fontSize: "20px",
    lineHeight: 1.6,
  },
  subtext: {
    fontSize: "16px",
    color: "#ddd",
    marginTop: "1rem",
    fontStyle: "italic",
  },
  orange: {
    color: "#ffa726",
    fontWeight: "bold",
  },
};

export default Login;
