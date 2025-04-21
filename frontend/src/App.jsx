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
  const [status, setStatus] = useState({ loaded: false, approved: false, isAdmin: false });
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) {
      setStatus({ loaded: true, approved: false, isAdmin: false });
      return;
    }
    // Check admin status from backend by email
    fetch(`http://localhost:5750/api/admin-status?email=${email}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          //use isApprovedAdmin flag to determine approved status.
          setStatus({ loaded: true, approved: data.isApprovedAdmin, isAdmin: true });
        } else {
          // Even if backend returns failure, leave isAdmin false.
          setStatus({ loaded: true, approved: false, isAdmin: false });
        }
      })
      .catch(err => {
        console.error("Error checking admin status:", err);
        setStatus({ loaded: true, approved: false, isAdmin: false });
      });
  }, [email]);

  if (!status.loaded) return <p>Loading...</p>;

  // show the PendingAdminPage for everyone who is not an approved admin.
  if (!status.isAdmin || (status.isAdmin && !status.approved)) 
    return <PendingAdminPage />;

  // Only approved admins get to see the admin dashboard.
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