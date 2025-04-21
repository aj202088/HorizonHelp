import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import ButtonsTop from "../components/ButtonsTop";
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
    <div style={{ background: 'radial-gradient(92.52% 55.47% at 25.97% 50%, #DCAA7E 0%, #C56715 48.56%, #EE8523 100%)', height: "100vh", width: "100vw", padding: "2rem", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", gap: "1rem" }}>
        <ButtonsTop onPress={() => {}}>Account</ButtonsTop>
        <ButtonsTop onPress={() => {}}>Log out</ButtonsTop>
        <ButtonsTop onPress={() => {}}>Resources</ButtonsTop>
        <ButtonsTop onPress={() => {}}>First Responder? Click Here</ButtonsTop>
        <ButtonsTop onPress={() => {}}>View Alert Inbox</ButtonsTop>
      </div>
      <div style={{ display: "flex", marginTop: "8rem", alignItems: "flex-start", gap: "2rem" }}>
        {/* Left Column: Info + Notifications */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>HorizonHelp</h1>
          <p style={{
            color: "#69605A",
            fontFamily: "Inter, sans-serif",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "-0.4px"
          }}>
            HorizonHelp is an emergency response application that provides users with real-time alerts, heatmaps indicating severity of local fires, and informational help and resources to its users.
          </p>

          {/* Alerts */}
          <div style={{
            marginTop: "1.5rem",
            backgroundColor: "#1a1a1a",
            padding: "1rem",
            borderRadius: "8px",
            color: "white",
            maxWidth: "90%",
          }}>
            <h2>Alerts</h2>
            {notifications.length === 0 ? (
              <p>No alerts yet.</p>
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

            <textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "100%", height: "60px", marginTop: "0.5rem", padding: "0.5rem", borderRadius: "4px" }}
            />
            <button
              onClick={handleSend}
              disabled={isSubmitting}
              style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
            {success && <p style={{ color: "green", marginTop: "0.5rem" }}>{success}</p>}
            {err && <p style={{ color: "red", marginTop: "0.5rem" }}>{err}</p>}
          </div>
        </div>

        {/* Right Column: Map */}
        <div style={{ flex: 1 }}>
          {coords ? (
            <MapComponent position={coords} />
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p>Loading your map...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
