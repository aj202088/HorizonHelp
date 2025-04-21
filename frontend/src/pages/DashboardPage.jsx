import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import ButtonsTop from "../components/ButtonsTop";
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
    <div style={{  background: 'radial-gradient(92.52% 55.47% at 25.97% 50%, #DCAA7E 0%, #C56715 48.56%, #EE8523 100%)', padding: "2rem", minHeight: '100vh', width: '100vw',}}>

     <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", gap: "1rem" }}>
    {/* Buttons to view other things  */}
    <ButtonsTop onPress={() => {}}>Account</ButtonsTop>
    <ButtonsTop onPress={() => {}}>Log out</ButtonsTop>
    <ButtonsTop onPress={() => {}}>Resources</ButtonsTop>
    <ButtonsTop onPress={() => {}}>First Responder? Click Here</ButtonsTop>
    <ButtonsTop onPress={() => {}}>View Alert Inbox</ButtonsTop>
    </div> 
    <div
        style={{
          display: "flex",
          marginTop: "4rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "5rem",
          gap: "2rem",
        }}
      >
    <div style={{ maxWidth: "60%", marginTop: "-25rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>HorizonHelp</h1>
        <p
          style={{
            color: "#69605A",
            fontFamily: "Inter, sans-serif",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 700,
            lineHeight: "normal",
            letterSpacing: "-0.4px",
          }}
        >
          HorizonHelp is an emergency response application that provides users
          with real-time alerts, heatmaps indicating severity of local fires,
          and informational help and resources to its users.
        </p>
      </div>
      {/* Move map to same flex box beside text*/}
      <div style={{ flex: 1 }}>
        {/* Show map */}
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
  </div>
  );
};

export default DashboardPage;
