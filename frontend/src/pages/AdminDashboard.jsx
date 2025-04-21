import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending admin requests from the backend
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAdmins();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, approved admin!</p>
      <h2>Pending Admin Requests</h2>
      {loading ? (
        <p>Loading pending requests...</p>
      ) : pendingAdmins.length === 0 ? (
        <p>No pending admin requests at the moment.</p>
      ) : (
        <ul style={styles.list}>
          {pendingAdmins.map((admin) => (
            <li key={admin._id}>
              <strong>{admin.email}</strong> from {admin.city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    minHeight: "100vh",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
};

export default AdminDashboard;