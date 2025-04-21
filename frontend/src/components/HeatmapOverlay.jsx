import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat";


// Renders a Leaflet heatmap using an array of [lat, lng, intensity] points.
const HeatmapOverlay = ({ points }) => {
    // Access the map instance using React-Leaflet's hook
    const map = useMap();

    useEffect(() => {
        // If map is not loaded yet or there are no points, do nothing
        if (!map || !points.length) return;

        // Create Leaflet heat layer using given points
        const heat = L.heatLayer(points.map(([lat, lng, intensity]) => [lat, lng, intensity]), {
            // Radius of each heat point
            radius: 70,
            // Amount of blur
            blur: 20,
            // Max zoom level where heat points are visible
            maxZoom: 13
        }).addTo(map);

        // Add individual circles for visual per-point radius
        const circleLayers = points.map(([lat, lng, intensity, radius]) => {
            let color;
            // Critical
            if (intensity == 0.6) color = "red";
            // High
            else if (intensity == 0.45) color = "orange";
            // Moderate
            else if (intensity == 0.3) color = "yellow";
            // Low
            else color = "green";

            // Create the circle with dynamic styling
            return L.circle([lat, lng], {
                radius: radius,
                color: color,
                fillColor: color,
                fillOpacity: intensity,
            }).addTo(map);
        });

        return () => {
            // Remove heat layer when component unmounts or updates
            map.removeLayer(heat);
            circleLayers.forEach(layer => map.removeLayer(layer));
        };
    // Re-run effect when points or map updates
    }, [points, map]);

    // When the component doesnt render any visible JSX
    return null;
    };

export default HeatmapOverlay;
