import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Register from './components/Register'

// Main App component
// This component defines the routes for the application
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/register" element={<Register />} />
      
      {/* Catch-all route to redirect unknown paths */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App