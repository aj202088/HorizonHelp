// src/pages/DashboardPage.jsx

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
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchUserFromBackend = async () => {
      try {
        const response = await fetch(`http://localhost:5750/user?email=${email}`);
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          setEditedUser(data.user);
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

  const handleEditChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:5750/user/${user._id}`, editedUser);
      if (response.data.success) {
        setUser(editedUser);
        setEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error saving changes.");
    }
  };

  return (
    <div style={{
      backgroundImage: 'url(/src/assets/forest.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      width: '100vw',
      padding: '2rem',
      boxSizing: 'border-box',
      position: 'relative',
      color: "#fff"
    }}>
      <div style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(34, 63, 40, 0.5)",
        zIndex: -1
      }}></div>

      <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", gap: "1rem" }}>
        <ButtonsTop onPress={() => setShowAccount(!showAccount)}>Account</ButtonsTop>
        <ButtonsTop onPress={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}>Log out</ButtonsTop>
        <ButtonsTop>Resources</ButtonsTop>
        <ButtonsTop>First Responder? Click Here</ButtonsTop>
        <ButtonsTop>View Alert Inbox</ButtonsTop>
      </div>

      {showAccount && (
        <div style={{
          position: "absolute", top: "6rem", left: "2rem", zIndex: 10,
          backgroundColor: "#111", borderRadius: "10px", padding: "1rem", width: "280px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)", color: "#fff"
        }}>
          <img src={droplet} alt="avatar" style={{
            width: "80px", height: "80px", borderRadius: "50%",
            display: "block", margin: "0 auto"
          }} />
          <h3 style={{ textAlign: "center", marginTop: "0.5rem", fontWeight: "bold" }}>{user?.name || "Name not found"}</h3>
          <p><strong>Email:</strong> {user?.email}</p>

          {["phone", "street", "city", "state", "zip", "country"].map((field) => (
            <div key={field}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
              {editing ? (
                <input
                  name={field}
                  value={editedUser[field] || ""}
                  onChange={handleEditChange}
                  style={{ backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", padding: "4px", marginTop: "2px", width: "100%" }}
                />
              ) : (
                user?.[field] || "N/A"
              )}
            </div>
          ))}

          <button
            onClick={editing ? handleSave : () => setEditing(true)}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.5rem",
              backgroundColor: "#ffa500",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", marginTop: "8rem", alignItems: "flex-start", gap: "2rem" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", textShadow: "1px 1px 5px #000" }}>HorizonHelp</h1>
          <p style={{
            fontSize: "18px",
            color: "#e0e0e0",
            fontWeight: "500",
            textShadow: "1px 1px 3px #000",
            maxWidth: "90%"
          }}>
            HorizonHelp is an emergency response application that provides users with real-time alerts,
            heatmaps indicating severity of local fires, and informational help and resources.
          </p>

          <div style={{
            marginTop: "1.5rem",
            background: "rgba(0, 0, 0, 0.6)",
            padding: "1rem",
            borderRadius: "8px",
            color: "white",
            maxWidth: "90%",
          }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Alerts</h2>
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
              style={{ width: "100%", height: "60px", marginTop: "0.5rem", padding: "0.5rem", borderRadius: "4px", background: "#222", color: "#fff" }}
            />
            <button
              onClick={handleSend}
              disabled={isSubmitting}
              style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#ffa500", color: "#111", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
            {success && <p style={{ color: "lightgreen", marginTop: "0.5rem" }}>{success}</p>}
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
