// At top of your file:
import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import ButtonsTop from "../components/ButtonsTop";
import { getCoordinatesFromAddress } from "../Utils/geocode";
import droplet from "../assets/droplet.png";
import axios from "axios";

const DashboardPage = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");

  const [showAccount, setShowAccount] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchUserFromBackend = async () => {
      try {
        const res = await fetch(`http://localhost:5750/user?email=${email}`);
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setEditedUser(data.user); // initial values for editing
          const { street, city, state, zip, country } = data.user;
          const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;
          const coordinates = await getCoordinatesFromAddress(fullAddress);
          if (coordinates) setCoords(coordinates);
          else setError("Could not geocode address.");
        } else {
          setError("User not found.");
        }
      } catch (err) {
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
        .catch(() => setErr("Failed to load notifications."));
    }
  }, [user]);

  const handleSend = async () => {
    if (!message) return;
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5750/notifications/user-alert", {
        userEmail: email,
        message
      });
      setMessage("");
      setSuccess("Notification sent.");
      const updated = await axios.get(`http://localhost:5750/notifications/${user._id}`);
      setNotifications(updated.data.messages);
    } catch {
      setErr("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`http://localhost:5750/user/${user._id}`, editedUser);
      if (res.data.success) {
        setUser(editedUser);
        setEditMode(false);
        setSuccess("Account updated.");
      }
    } catch {
      setErr("Failed to update profile.");
    }
  };

  return (
    <div style={{ background: 'radial-gradient(92.52% 55.47% at 25.97% 50%, #DCAA7E 0%, #C56715 48.56%, #EE8523 100%)', height: "100vh", width: "100vw", padding: "2rem", boxSizing: "border-box", position: "relative" }}>
      <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", gap: "1rem" }}>
        <ButtonsTop onPress={() => setShowAccount(!showAccount)}>Account</ButtonsTop>
        <ButtonsTop onPress={() => {
          localStorage.removeItem("userEmail");
          window.location.href = "/login";
        }}>Log out</ButtonsTop>
        <ButtonsTop>Resources</ButtonsTop>
        <ButtonsTop>First Responder? Click Here</ButtonsTop>
        <ButtonsTop>View Alert Inbox</ButtonsTop>
      </div>

      {showAccount && (
        <div style={{ position: "absolute", top: "6rem", left: "2rem", backgroundColor: "#111", color: "white", borderRadius: "12px", padding: "1.5rem", width: "320px", zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          <img src={droplet} alt="avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", display: "block", margin: "0 auto" }} />
          <h3 style={{ textAlign: "center", margin: "0.5rem 0" }}>{user?.name || "N/A"}</h3>
          <p><strong>Email:</strong> {user?.email || "N/A"}</p>

          {["phone", "street", "city", "state", "zip", "country"].map(field => (
            <p key={field}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
              {editMode ? (
                <input
                  type="text"
                  value={editedUser[field] || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, [field]: e.target.value })}
                  style={{ marginLeft: "8px", padding: "3px", borderRadius: "4px", border: "none" }}
                />
              ) : (
                user?.[field] || "N/A"
              )}
            </p>
          ))}

          {editMode ? (
            <button onClick={handleSave} style={{ marginTop: "1rem", backgroundColor: "#FFA500", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", width: "100%", fontWeight: "bold" }}>
              Save
            </button>
          ) : (
            <button onClick={() => setEditMode(true)} style={{ marginTop: "1rem", backgroundColor: "#FFA500", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", width: "100%", fontWeight: "bold" }}>
              Edit
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", marginTop: "8rem", alignItems: "flex-start", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>HorizonHelp</h1>
          <p style={{ color: "#333", fontSize: "18px", maxWidth: "600px" }}>
            HorizonHelp is an emergency response application that provides users with real-time alerts, heatmaps indicating severity of local fires, and informational help and resources to its users.
          </p>

          <div style={{ marginTop: "1.5rem", backgroundColor: "#1a1a1a", padding: "1rem", borderRadius: "8px", color: "white", maxWidth: "90%" }}>
            <h2>Alerts</h2>
            {notifications.length === 0 ? (
              <p>No alerts yet.</p>
            ) : (
              notifications.map((note, i) => (
                <div key={i} style={{ backgroundColor: "#333", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "5px" }}>
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
              style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#FFA500", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
            {success && <p style={{ color: "green", marginTop: "0.5rem" }}>{success}</p>}
            {err && <p style={{ color: "red", marginTop: "0.5rem" }}>{err}</p>}
          </div>
        </div>

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
