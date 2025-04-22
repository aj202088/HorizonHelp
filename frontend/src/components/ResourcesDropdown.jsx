// src/components/ResourcesDropdown.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ResourcesDropdown = ({ coords, onClose, onSelectResource }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Hospitals", tag: "amenity=hospital" },
    { name: "Fire Stations", tag: "amenity=fire_station" },
    { name: "Animal Shelters", tag: "amenity=animal_shelter" }
  ];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const queries = categories.map(category => `
          node[${category.tag}](around:5000,${coords[0]},${coords[1]});
          way[${category.tag}](around:5000,${coords[0]},${coords[1]});
          relation[${category.tag}](around:5000,${coords[0]},${coords[1]});
        `).join("\n");

        const overpassQuery = `
          [out:json][timeout:25];
          (
            ${queries}
          );
          out center;
        `;

        const response = await axios.post(
          "https://overpass-api.de/api/interpreter",
          `data=${encodeURIComponent(overpassQuery)}`,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const elements = response.data.elements;
        const parsedResources = elements.map(el => ({
          name: el.tags?.name || "Unnamed",
          type: el.tags?.amenity || el.tags?.emergency || "Unknown",
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          website: el.tags?.website || null,
          address: [
            el.tags?.["addr:housenumber"],
            el.tags?.["addr:street"],
            el.tags?.["addr:city"]
          ].filter(Boolean).join(" ") || null
        }));

        setResources(parsedResources);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    if (coords) fetchResources();
  }, [coords]);

  return (
    <div style={{
      position: "absolute",
      top: "6rem",
      left: "12rem",
      backgroundColor: "#111",
      padding: "1rem",
      borderRadius: "10px",
      width: "320px",
      zIndex: 20,
      boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
      color: "#fff"
    }}>
      <h3 style={{ marginBottom: "0.5rem", fontSize: "18px" }}>Local Resources</h3>
      <button onClick={onClose} style={{ float: "right", background: "none", color: "#aaa", border: "none", fontSize: "1rem", cursor: "pointer" }}>✖</button>
      {loading ? (
        <p>Loading nearby facilities...</p>
      ) : resources.length === 0 ? (
        <p>No nearby resources found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {resources.map((res, idx) => (
            <li key={idx} onClick={() => onSelectResource([res.lat, res.lon])} style={{
              padding: "0.6rem 0",
              borderBottom: "1px solid #333",
              cursor: "pointer"
            }}>
              <strong>{res.name}</strong><br />
              <span style={{ fontSize: "0.85rem", color: "#aaa" }}>{res.type}</span><br />
              {res.address && <span style={{ fontSize: "0.75rem", color: "#ccc" }}>{res.address}</span>}<br />
              {res.website && (
                <a href={res.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#61dafb" }}>
                  Visit Website
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourcesDropdown;
