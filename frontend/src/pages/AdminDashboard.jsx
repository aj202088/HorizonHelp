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
  const [severity, setSeverity] = useState("");
  const [radius, setRadius] = useState(5);
  const [userAlerts, setUserAlerts] = useState([]);
  const adminEmail = localStorage.getItem("userEmail");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  useEffect(() => {
    const fetchPendingAdmins = async () => {
      try {
        const response = await fetch("http://localhost:5750/api/pending-admins");
        const data = await response.json();
        if (data.success) setPendingAdmins(data.pendingAdmins);
      } catch (err) {
        console.error("Error fetching pending admins:", err);
      }
    };

    const fetchUsersCount = async () => {
      try {
        const response = await axios.get("http://localhost:5750/api/users-count");
        if (response.data.success) setUsersCount(response.data.count);
      } catch (err) {
        console.error("Error fetching users count:", err);
      }
    };

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

  useEffect(() => {
    const fetchUserAlerts = async () => {
      try {
        const response = await axios.get("http://localhost:5750/user-alerts");
        if (response.data.success) {
          setUserAlerts(response.data.alerts.filter(alert => !alert.resolved));
          //setUserAlerts(response.data.alerts);
          //setUserAlerts(prev => prev.filter(a => a._id !== alertId));
        }
      } catch (err) {
        console.error("Failed to load user alerts:", err);
      }
    };

    fetchUserAlerts();
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
        severity,
        radius,
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };  

  const handleResolve = async (alertId) => {
    try {
      await axios.put(`http://localhost:5750/notifications/resolve/${alertId}`, { resolved: true });
      setUserAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Admin Dashboard</h1>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: "0.6rem 1.2rem",
              fontSize: "1rem",
              backgroundColor: "#FFA500",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              boxShadow: "0 0 10px rgba(238, 159, 12, 0.89)",
              cursor: "pointer"
            }}
          >
            Log Out
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.card}><h3>Total Users</h3><p>{usersCount}</p></div>
          <div style={styles.card}><h3>Alerts Sent</h3><p>{alertsSent}</p></div>
          <div style={styles.card}><h3>Pending Requests</h3><p>{pendingAdmins.length}</p></div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div style={{
          position: "absolute",
          top: "6rem",
          right: "2rem",
          backgroundColor: "#111",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>Are you sure you want to log out?</p>
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              style={{
                backgroundColor: "#FFA500",
                color: "#000",
                border: "none",
                padding: "0.4rem 1rem",
                borderRadius: "5px"
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                padding: "0.4rem 1rem",
                borderRadius: "5px"
              }}
            >
              No
            </button>
          </div>
        </div>
      )}


      <div style={styles.mainGrid}>
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
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
          <input
            type="number"
            placeholder="Incident Radius (miles)"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            style={styles.input}
          />
          <ButtonsTop onPress={handleBroadcast}>Send Alert</ButtonsTop>
          {broadcastSuccess && <p style={styles.success}>{broadcastSuccess}</p>}
          {broadcastError && <p style={styles.error}>{broadcastError}</p>}
        </section>

        <section style={styles.inboxSection}>
          <h2>User Alert Inbox</h2>
          {userAlerts.map(alert => (
            <div key={alert._id} style={styles.inboxCard}>
              <p><strong>Name:</strong> {alert.sender.name}</p>
              <p><strong>Address:</strong> {`${alert.sender.street}, ${alert.sender.city}, ${alert.sender.state} ${alert.sender.zip}, ${alert.sender.country}`}</p>
              <p><strong>Message:</strong> {alert.message}</p>
              <label>
                Resolved:{" "}
                <input
                  type="checkbox"
                  onChange={() => handleResolve(alert._id)}
                />
              </label>
            </div>
          ))}
        </section>
      </div>

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
    backgroundImage: 'linear-gradient(rgba(5, 25, 5, 0.9), rgba(5, 25, 5, 0.9)), url("/src/assets/forest.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    color: "#fff",
    minHeight: "100vh",
    width: "100vw",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
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
    boxShadow: "0 0 10px 2px orange",
  },
  mainGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: "2rem",
    width: "100%",
    flexWrap: "nowrap",
    alignItems: "flex-start",
  },
  broadcastSection: {
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    width: "45%",
    boxShadow: "0 0 10px 2px orange",
  },
  inboxSection: {
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    width: "55%",
    boxShadow: "0 0 10px 2px orange",
    maxHeight: "500px",
    overflowY: "auto",
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
  inboxCard: {
    backgroundColor: "#444",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "6px",
    boxShadow: "0 0 6px 1px orange",
  },
  pendingSection: {
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "2rem",
    boxShadow: "0 0 10px 2px orange",
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
