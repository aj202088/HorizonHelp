import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoordinatesFromAddress } from "../Utils/geocode";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if address is correct when registering account
    const isAddressProvided = street || city || state || zip || country;
    if (isAddressProvided) {
      const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;
      const coords = await getCoordinatesFromAddress(fullAddress);
  
      // Only allow successful registration if there are valid coordinates
      if (!coords) {
        alert("The address you entered appears to be invalid. Please check it and try again.");
        return;
      }  
    }
    
    try {
      const response = await fetch("http://localhost:5750/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, street, city, state, zip, country, notifications }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration successful!");
        navigate("/login"); // Redirect to login after signup
      } 
      else {
        alert(data.message || "Registration failed.");
      }
    } 
    catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
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
          <input
            type="street"
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            style={styles.input}
          />
          <input
            type="city"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={styles.input}
          />
          <input
            type="state"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={styles.input}
          />
          <input
            type="zip"
            placeholder="Zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            style={styles.input}
          />
          <input
            type="country"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Sign Up</button>
        </form>
        <p style={styles.linkText}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>Log in</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#1e1e1e",
  },
  card: {
    backgroundColor: "#2c2c2c",
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
    width: "350px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
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
  linkText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#aaa",
  },
  link: {
    color: "#61dafb",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Register;