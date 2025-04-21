import React, { useEffect, useState } from "react";
import ButtonsTop from "../components/ButtonsTop";
import axios from "axios";

const AdminDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [alertsSent, setAlertsSent] = useState(0);
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState("");
  const [broadcastError, setBroadcastError] = useState("");

  const adminEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    // Fetch pending admin requests
    const fetchPendingAdmins = async () => {
      try {
        const response = await fetch("http://localhost:5750/api/pending-admins");
        const data = await response.json();
        if (data.success) {
          setPendingAdmins(data.pendingAdmins);
        } else {
          console.error("Error fetching pending admins:", data.message);
        }
      } catch (err) {
        console.error("Error fetching pending admins:", err);
      }
    };

    // Fetch total users count from backend (create endpoint if needed)
    const fetchUsersCount = async () => {
      try {
        const response = await axios.get("http://localhost:5750/api/users-count");
        if (response.data.success) {
          setUsersCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching users count:", err);
      }
    };

    // Fetch total alerts sent count (create endpoint if needed)
    const fetchAlertsSent = async () => {
      try {
        const response = await axios.get("http://localhost:5750/api/alerts-sent");
        if (response.data.success) {
          setAlertsSent(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching alerts count:", err);
      }
    };

    fetchPendingAdmins();
    fetchUsersCount();
    fetchAlertsSent();
  }, []);

  const handleBroadcast = async () => {
    if (!message || !city) {
      setBroadcastError("Both message and city are required.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5750/notifications/admin-broadcast", {
        adminEmail,
        message,
        city,
      });
      if (response.data.success) {
        setBroadcastSuccess(response.data.message);
        setMessage("");
        setCity("");
      } else {
        setBroadcastError(response.data.message || "Broadcast failed.");
      }
    } catch (err) {
      console.error("Error sending broadcast:", err);
      setBroadcastError("Failed to send broadcast.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Admin Dashboard</h1>
        <div style={styles.stats}>
          <div style={styles.card}>
            <h3>Total Users</h3>
            <p>{usersCount}</p>
          </div>
          <div style={styles.card}>
            <h3>Alerts Sent</h3>
            <p>{alertsSent}</p>
          </div>
          <div style={styles.card}>
            <h3>Pending Requests</h3>
            <p>{pendingAdmins.length}</p>
          </div>
        </div>
      </header>

      <section style={styles.broadcastSection}>
        <h2>Broadcast Alert</h2>
        <textarea 
          placeholder="Write your alert message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
        />
        <input 
          type="text"
          placeholder="Target City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <ButtonsTop onPress={handleBroadcast}>Send Alert</ButtonsTop>
        {broadcastSuccess && <p style={styles.success}>{broadcastSuccess}</p>}
        {broadcastError && <p style={styles.error}>{broadcastError}</p>}
      </section>

      <section style={styles.pendingSection}>
        <h2>Pending Admin Requests</h2>
        {pendingAdmins.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul style={styles.list}>
            {pendingAdmins.map((admin) => (
              <li key={admin._id} style={styles.listItem}>
                <strong>{admin.email}</strong> from {admin.city}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "2rem",
  },
  stats: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  card: {
    backgroundColor: "#333",
    padding: "1rem",
    borderRadius: "8px",
    flex: 1,
    textAlign: "center",
  },
  broadcastSection: {
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "0.5rem",
    borderRadius: "5px",
    marginBottom: "1rem",
    border: "none",
    resize: "vertical",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "5px",
    marginBottom: "1rem",
    border: "none",
  },
  success: {
    color: "lightgreen",
  },
  error: {
    color: "red",
  },
  pendingSection: {
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  listItem: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #444",
  },
};

export default AdminDashboard;