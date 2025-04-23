// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import ButtonsTop from "../components/ButtonsTop";
import { getCoordinatesFromAddress } from "../Utils/geocode";
import droplet from "../assets/droplet.png";
import axios from "axios";
import ResourcesDropdown from "../components/ResourcesDropdown";

const DashboardPage = () => {
  const [coords, setCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResources, setShowResources] = useState(false);

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
          if (coordinates) {
            setCoords(coordinates);
            setMapCenter(coordinates);
          } else {
            setError("Could not geocode address.");
          }
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

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`http://localhost:5750/user/${user._id}`, editedUser);
      if (res.data.success) {
        setUser(editedUser);
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to save edits:", err);
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      backgroundImage: 'linear-gradient(rgba(5, 25, 5, 0.85), rgba(5, 25, 5, 0.85)), url("/src/assets/forest.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "white",
      padding: "2rem",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", gap: "1rem" }}>
        <ButtonsTop onPress={() => setShowAccount(!showAccount)}>Account</ButtonsTop>
        <div style={{ position: "relative" }}>
          <ButtonsTop onPress={() => setShowLogoutConfirm(true)}>Log out</ButtonsTop>
          {showLogoutConfirm && (
            <div style={{ 
              position: "absolute", 
              top: "3.5rem", left: 0, 
              backgroundColor: "#111", 
              padding: "1.5rem", 
              borderRadius: "12px", 
              boxShadow: "0 0px 20px rgba(214, 144, 13, 0.91)", 
              zIndex: 20,
              minWidth: "260px",
              fontSize: "1rem" 
              }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Are you sure you want to log out?</p>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <button onClick={confirmLogout} style={{ backgroundColor: "#FFA500", color: "#000", border: "none", padding: "0.4rem 1rem", borderRadius: "5px" }}>Yes</button>
                <button onClick={() => setShowLogoutConfirm(false)} style={{ backgroundColor: "#444", color: "#fff", border: "none", padding: "0.4rem 1rem", borderRadius: "5px" }}>No</button>
              </div>
            </div>
          )}
        </div>
        <ButtonsTop onPress={() => setShowResources(!showResources)}>Resources</ButtonsTop>
        {/*<ButtonsTop onPress={() => { }}>First Responder? Click Here</ButtonsTop>*/}
        {/*<ButtonsTop onPress={() => { }}>View Alert Inbox</ButtonsTop>*/}
      </div>

      {showAccount && (
        <div style={{
          position: "absolute", top: "6rem", left: "2rem", zIndex: 10,
          backgroundColor: "#111", borderRadius: "10px", padding: "1.5rem",
          width: "300px", boxShadow: "0 4px 10px rgba(214, 144, 13, 0.91)",
        }}>
          <img src={droplet} alt="avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", display: "block", margin: "0 auto" }} />
          <h3 style={{ textAlign: "center", marginTop: "0.5rem", fontWeight: "bold" }}>{user?.name || "Name not found"}</h3>
          <div style={{ fontSize: "14px", marginTop: "1rem" }}>
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>
            {editing ? (
              <>
                <label>Name: <input value={editedUser.name || ""} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} /></label><br />
                <label>Phone: <input value={editedUser.phone || ""} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} /></label><br />
                <label>Street: <input value={editedUser.street || ""} onChange={(e) => setEditedUser({ ...editedUser, street: e.target.value })} /></label><br />
                <label>City: <input value={editedUser.city || ""} onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })} /></label><br />
                <label>State: <input value={editedUser.state || ""} onChange={(e) => setEditedUser({ ...editedUser, state: e.target.value })} /></label><br />
                <label>Zip: <input value={editedUser.zip || ""} onChange={(e) => setEditedUser({ ...editedUser, zip: e.target.value })} /></label><br />
                <label>Country: <input value={editedUser.country || ""} onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })} /></label><br />
                <button onClick={handleSaveEdit} style={{ marginTop: "0.5rem", backgroundColor: "#ffa500", color: "#000", padding: "0.4rem 1rem", borderRadius: "5px", border: "none" }}>Save</button>
              </>
            ) : (
              <>
                <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
                <p><strong>Street:</strong> {user?.street || "N/A"}</p>
                <p><strong>City:</strong> {user?.city || "N/A"}</p>
                <p><strong>State:</strong> {user?.state || "N/A"}</p>
                <p><strong>ZIP:</strong> {user?.zip || "N/A"}</p>
                <p><strong>Country:</strong> {user?.country || "N/A"}</p>
                <button onClick={() => setEditing(true)} style={{ marginTop: "0.5rem", backgroundColor: "#ffa500", color: "#000", padding: "0.4rem 1rem", borderRadius: "5px", border: "none" }}>Edit</button>
              </>
            )}
          </div>
        </div>
      )}

      {showResources && coords && (
        <ResourcesDropdown coords={coords} onSelectLocation={(loc) => setMapCenter([loc.lat, loc.lon])} onClose={() => setShowResources(false)} />
      )}

      <div style={{ display: "flex", marginTop: "8rem", alignItems: "flex-start", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.6)" }}>HorizonHelp</h1>
          <p style={{fontSize: "20px", fontWeight: 500, maxWidth: "90%", textShadow: "1px 1px 3px rgba(0,0,0,0.6)"}}>
            HorizonHelp is an emergency response application that provides users with real-time alerts, heatmaps indicating severity of local fires, and informational help and resources.
          </p>
          <div style={{
            marginTop: "1.5rem", backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem", borderRadius: "12px", maxWidth: "100%",
            boxShadow: "0 2px 22px rgba(203, 138, 17, 0.85)"
          }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Alerts</h2>
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
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>From:</strong> {note.sender?.name || "Unknown"} ({note.sender?.email || "N/A"})
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Severity:</strong> {note.severity || "N/A"}
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Time:</strong> {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Message:</strong> {note.message}
                  </p>
                </div>
              ))
            )}
            <textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "100%", height: "60px", marginTop: "0.5rem", padding: "0.5rem", borderRadius: "4px", backgroundColor: "#222", color: "white", border: "1px solid #444" }}
            />
            <button
              onClick={handleSend}
              disabled={isSubmitting}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#e38828", //button colour
                color: "#fff", //text colour
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer", 
                fontWeight: "bold"
              }}
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
            {success && <p style={{ color: "lightgreen", marginTop: "0.5rem" }}>{success}</p>}
            {err && <p style={{ color: "red", marginTop: "0.5rem" }}>{err}</p>}
          </div>
        </div>

        <div style={{ 
          flex: 1,  
          backgroundColor: "rgba(0, 0, 0, 0)", 
          padding: "1rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 20px rgba(218, 146, 12, 0.86)" }}>
          {coords ? (
            <>
              <MapComponent position={mapCenter || coords} />
              <div style={{ marginTop: "1rem" }}>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Severity Legend</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "20px", height: "20px", backgroundColor: "red", display: "inline-block", borderRadius: "4px" }}></span>
                    <span>Critical</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "20px", height: "20px", backgroundColor: "orange", display: "inline-block", borderRadius: "4px" }}></span>
                    <span>High</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "20px", height: "20px", backgroundColor: "yellow", display: "inline-block", borderRadius: "4px" }}></span>
                    <span>Moderate</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "20px", height: "20px", backgroundColor: "green", display: "inline-block", borderRadius: "4px" }}></span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </>
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
