// Need coordinates for leaflet, therefore need to geocode with nominatim
export const getCoordinatesFromAddress = async (address) => {
    // Temp
    console.log("Geocoding: ", address);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
  
      if (!response.ok) {
        console.error("Geocoding request failed:", response.status);
        return null;
      }
  
      const data = await response.json();
  
      // Retrieve latitude and longitude for leaflet
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      // If address cannot be found when geocoding
      else {
          console.warn("No results found for: ", address);
      }
      // Address not found
      return null;
    }
    catch (err) {
      console.error("Error during geocoding: ", err);
      return null;
    }
  };
  