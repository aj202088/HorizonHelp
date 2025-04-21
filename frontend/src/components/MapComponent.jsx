// src/components/MapComponent.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HeatmapOverlay from './HeatmapOverlay';

// Fix marker icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const MapComponent = ({ position }) => {
  // React state to store formatted heatmap points for Leaflet
  const [heatPoints, setHeatPoints] = useState([]);
  // Fetch heatmap data within 100 miles of user's location
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        // Call backend API to retrieve nearby incidents using user's lat/lng
        const response = await fetch(`http://localhost:5750/incidents/nearby?lat=${position[0]}&lng=${position[1]}`);
        const data = await response.json();

        // If the response was successful and contains a valid array of points then save those points to state to render heatmap
        if (data.success && Array.isArray(data.points)) {
          setHeatPoints(data.points);
        }
      } 
      catch (error) {
        // Log any errors encountered while fetching data
        console.error('Error fetching heatmap data:', error);
      }
    };
    // Run the fetch logic only if the user's position is defined
    if (position) {
      fetchHeatmapData();
    }
  // Re-run effect whenever user's position is updated
  }, [position]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      // Default dimension
      style={{ height: '600px', width: '800px'}}
    >
      {/* OpenStreetMap tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {/* User's location marker with popup */}
      <Marker position={position}>
        <Popup>
          Your Location <br /> Based on your saved address.
        </Popup>
      </Marker>
      {/* Heatmap layer displaying incidents nearby */}
      {Array.isArray(heatPoints) && heatPoints.length > 0 && (
        <HeatmapOverlay points={heatPoints} />
      )}    
    </MapContainer>
  );
};

export default MapComponent;