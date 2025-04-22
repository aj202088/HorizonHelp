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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("approvedAdmin", data.user.approvedAdmin);
        if(data.user.approvedAdmin) {
          navigate("/admin");
        }
        else {
          navigate("/dashboard");
        }
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
      <div style={styles.overlay} />
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
        </form>
        <p style={styles.registerText}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.registerLink}>Register here</Link>
        </p>
      </div>

      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>
          <span role="img" aria-label="fire">🔥</span> Welcome to <span style={{ color: "#FFA132" }}>HorizonHelp 🔥</span>
        </h1>
        <p style={styles.welcomeText}>
          Your go-to platform for <span style={{ color: "#FFA132" }}>fire alerts</span>, 
          <span style={{ color: "#FFA132" }}> safety tracking</span>, and 
          <span style={{ color: "#FFA132" }}> first responder coordination</span>.
        </p>
        <p style={styles.welcomeSubtext}>Stay informed. Stay safe. Stay connected.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100vh",
    width: "100vw",
    backgroundImage: 'url(/src/assets/forest.jpg)',
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "0 6%",
    zIndex: 1
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "rgba(0, 0, 0, 0.3)",
    zIndex: 0
  },
  card: {
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    color: "#fff",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontSize: "22px",
    marginBottom: "20px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1e1e1e",
    color: "#fff"
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#FFA132",
    color: "#fff",
    cursor: "pointer"
  },
  registerText: {
    fontSize: "14px",
    marginTop: "10px",
    color: "#ccc",
    textAlign: "center"
  },
  registerLink: {
    color: "#FFA132",
    textDecoration: "underline"
  },

  welcomeSection: {
    flex: 2,
    padding: "70px 40px 120px 120px", // top right bottom left
    color: "#fff",
    textAlign: "center",
    maxWidth: "600px",
    marginRight: "auto" // ensures it pushes left
  },  

  welcomeTitle: {
    fontSize: "39px",
    fontWeight: "bold",
    marginBottom: "50px",
    textShadow: "2px 5px 5px rgba(0,0,0,0.6)"
  },

  welcomeText: {
    fontSize: "24px",
    lineHeight: "1.6",
    marginBottom: "15px",
    textShadow: "5px 5px 5px rgba(0,0,0,0.6)"
  },
  welcomeSubtext: {
    fontStyle: "italic",
    fontSize: "18px",
    textShadow: "5px 5px 5px rgba(0,0,0,0.6)"
  }
};

export default Login;
