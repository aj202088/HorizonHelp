import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Register from './components/Register'
import AdminDashboard from "./pages/AdminDashboard";
import PendingAdminPage from "./pages/PendingAdminPage";

// ProtectedAdminRoute component checks if the user is an admin and approved admin
// If not, redirects to the PendingAdminPage
const ProtectedAdminRoute = ({ children }) => {
  const [status, setStatus] = useState({ loaded: false, approved: false });
  const email = localStorage.getItem("userEmail");
  const localApproved = localStorage.getItem("approvedAdmin") === "true";

  useEffect(() => {
    if (!email) {
      setStatus({ loaded: true, approved: false });
      return;
    }
    // Optionally use localStorage value if available
    if (localApproved) {
      setStatus({ loaded: true, approved: true });
    } else {
      // Check admin status from backend by email
      fetch(`http://localhost:5750/api/admin-status?email=${email}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setStatus({ loaded: true, approved: data.isApprovedAdmin });
          } else {
            setStatus({ loaded: true, approved: false });
          }
        })
        .catch(err => {
          console.error("Error checking admin status:", err);
          setStatus({ loaded: true, approved: false });
        });
    }
  }, [email, localApproved]);

  if (!status.loaded) return <p>Loading...</p>;
  if (!status.approved) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      } />
      {/* Catch-all route to redirect unknown paths */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App