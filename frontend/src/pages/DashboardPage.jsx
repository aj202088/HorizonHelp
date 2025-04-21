import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import { getCoordinatesFromAddress } from "../Utils/geocode";
import axios from "axios";

const DashboardPage = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");

  const email = localStorage.getItem("userEmail");

  // Fetch user details and coordinates
  useEffect(() => {
    const fetchUserFromBackend = async () => {
      try {
        const response = await fetch(`http://localhost:5750/user?email=${email}`);
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          const { street, city, state, zip, country } = data.user;
          const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;
          const coordinates = await getCoordinatesFromAddress(fullAddress);
          if (coordinates) setCoords(coordinates);
          else setError("Could not geocode address.");
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data.");
      }
    };

    if (email) fetchUserFromBackend();
    else setError("No email in localStorage.");
  }, [email]);

  // Fetch notifications for this user
  useEffect(() => {
    if (user?._id) {
      axios.get(`http://localhost:5750/notifications/${user._id}`)
        .then(res => setNotifications(res.data.messages))
        .catch(err => {
          console.error("Notification fetch error:", err);
          setErr("Failed to load notifications.");
        });
    }
  }, [user]);

  const handleSend = async () => {
    if (!message) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5750/notifications/user-alert", {
        userEmail: email,
        message
      });
      setSuccess(res.data.message);
      setMessage("");
      // Refresh notifications
      const updated = await axios.get(`http://localhost:5750/notifications/${user._id}`);
      setNotifications(updated.data.messages);
    } catch (err) {
      console.error("Notification send error:", err);
      setErr("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", color: "white", width: "100vw", boxSizing: "border-box", overflowX: "hidden", height: "100vh" }}>
      {/* Left: Map Area */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <h1>Welcome to the Dashboard</h1>
        <p>This is the homepage after a successful login.</p>

        <div style={{ marginTop: "2rem" }}>
          {coords ? (
            <MapComponent position={coords} />
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p>Loading your map...</p>
          )}
        </div>
      </div>

      {/* Right: Notifications Panel */}
      <div style={{
        width: "400px",
        backgroundColor: "#1a1a1a",
        padding: "1rem",
        borderLeft: "1px solid #333",
        overflowY: "auto"
      }}>
        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((note, index) => (
            <div key={index} style={{
              backgroundColor: "#333",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "5px"
            }}>
              {note.message}
            </div>
          ))
        )}

        <div style={{ marginTop: "1rem" }}>
          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "100%", height: "60px", padding: "0.5rem", borderRadius: "4px" }}
          />
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isSubmitting ? "Sending..." : "Send Notification"}
          </button>
          {success && <p style={{ color: "green", marginTop: "0.5rem" }}>{success}</p>}
          {err && <p style={{ color: "red", marginTop: "0.5rem" }}>{err}</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
