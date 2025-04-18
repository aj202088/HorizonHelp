import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import { getCoordinatesFromAddress } from "../Utils/geocode";
// src/pages/DashboardPage.jsx

const DashboardPage = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");

  // Save email after login to reference
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    // Function to fetch user's full address from backend
    const fetchUserFromBackend = async () => {
      try {
        // Send GET request to backend to retrieve user info using stored email
        const response = await fetch(`http://localhost:5750/user?email=${email}`);
        const data = await response.json();

        // Check if user was found and contains valid address info
        if (data.success && data.user) {
          const { street, city, state, zip, country } = data.user;
          // Make full address for geocode address string util
          const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;
          // Use OpenStreetMap geocoder to convert address into [latitude,longitude]
          console.log("Full address to geocode:", fullAddress);
          const coordinates = await getCoordinatesFromAddress(fullAddress);

          // If geocoding successful, update state with coords
          if (coordinates) {
            setCoords(coordinates);
          } 
          // When address is not geocodable
          else {
            setError("Could not geocode address.");
          }
        } 
        // When user was not found in backend response
        else {
          setError("User not found.");
        }
      } 
      // Handle error for fetch and network errors
      catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data.");
      }
    };
  
    // Only run fetch if email is available
    if (email) {
      fetchUserFromBackend();
    } else {
      setError("No email in localStorage.");
    }
  }, [email]);

  return (
    <div style={{ color: "white", padding: "2rem" }}>
      <h1>Welcome to the Dashboard</h1>
      <p>This is the homepage after a successful login.</p>

      <div style={{ marginTop: "2rem" }}>
        {/* Show map once coordinates are loaded */}
        {coords ? (
          <MapComponent position={coords} />
        ) : error ? (
          // If there's an error then return error
          <p>{error}</p>
        ) : (
          // While loading the data and geocoding coords
          <p>Loading your map...</p>
        )}
      </div>
    </div>
  );
};

  
  export default DashboardPage;
  