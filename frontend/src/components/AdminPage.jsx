import React, { useState } from "react";

const AdminPage = () => {
    const [message, setMessage] = useState("");

    const sendNotification = async () => {
        try {
            const response = await fetch("http://localhost:5750/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            if (data.success) {
                alert("Notification sent successfully!");
            } else {
                alert(data.message || "Failed to send notification.");
            }
        } catch (err) {
            console.error("Error sending notification:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div style={{ padding: "2rem", color: "white" }}>
            <h1>Admin Dashboard</h1>
            <textarea
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "100%", height: "100px", marginBottom: "1rem" }}
            />
            <button onClick={sendNotification} style={{ padding: "1rem", backgroundColor: "#61dafb", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Send Notification
            </button>
        </div>
    );
};

export default AdminPage;