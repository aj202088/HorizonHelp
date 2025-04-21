
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoordinatesFromAddress } from "../Utils/geocode";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isAddressProvided = street || city || state || zip || country;
    if (isAddressProvided) {
      const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;
      const coords = await getCoordinatesFromAddress(fullAddress);

      if (!coords) {
        alert("The address you entered appears to be invalid. Please check it and try again.");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5750/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          street,
          city,
          state,
          zip,
          country,
          notifications,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input type="name" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
            <input type="street" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} style={styles.input} />
            <input type="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} />
            <input type="state" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={styles.input} />
            <input type="zip" placeholder="Zip" value={zip} onChange={(e) => setZip(e.target.value)} style={styles.input} />
            <input type="country" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} style={styles.input} />
            <button type="submit" style={styles.button}>Sign Up</button>
          </form>
          <p style={styles.linkText}>Already have an account? <a href="/login" style={styles.link}>Log in</a></p>
        </div>

        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}><span role="img" aria-label="fire">🔥</span> Welcome to <span style={{ color: "#FFA733" }}>HorizonHelp</span></h1>
          <p style={styles.welcomeText}>Your go-to platform for <span style={{ color: "#FFA733" }}>fire alerts, safety tracking</span>, and <span style={{ color: "#FFA733" }}>first responder coordination</span>.</p>
          <p style={styles.welcomeSubtext}>Stay informed. Stay safe. Stay connected.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: "relative",
    height: "100vh",
    width: "100vw",
    backgroundImage: "url(/src/assets/forest.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 0,
  },
  container: {
    display: "flex",
    zIndex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: "2rem",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: "2rem",
    borderRadius: "10px",
    width: "400px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#FFA733",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  linkText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#ccc",
  },
  link: {
    color: "#FFA733",
    textDecoration: "none",
    fontWeight: "bold",
  },
  welcomeSection: {
    color: "white",
    maxWidth: "550px",
    textShadow: "2px 2px 6px rgba(0, 0, 0, 0.9)",
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  welcomeText: {
    fontSize: "20px",
    color: "#ddd",
  },
  welcomeSubtext: {
    fontSize: "16px",
    color: "#ccc",
    marginTop: "15px",
    fontStyle: "italic",
  },
};

export default Register;
