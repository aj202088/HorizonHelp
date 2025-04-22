// src/components/MapComponent.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HeatmapOverlay from './HeatmapOverlay';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
};

const MapComponent = ({ position, resourceLocation }) => {
  const [heatPoints, setHeatPoints] = useState([]);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await fetch(`http://localhost:5750/incidents/nearby?lat=${position[0]}&lng=${position[1]}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.points)) {
          setHeatPoints(data.points);
        }
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      }
    };
    if (position) fetchHeatmapData();
  }, [position]);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '600px', width: '800px' }}>
      <MapCenterUpdater center={resourceLocation || position} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={position}>
        <Popup>
          Your Location <br /> Based on your saved address.
        </Popup>
      </Marker>
      {Array.isArray(heatPoints) && heatPoints.length > 0 && (
        <HeatmapOverlay points={heatPoints} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
