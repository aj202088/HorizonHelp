const { getDB } = require("./connect");

// Create collection containing the create function using inputted incident notification data
const incidentCollection = {
  async createIncident(data) {
    // Get the existing database
    const db = getDB();

    // Get existing collection of users to compare potential new user to
    const collection = db.collection("incidents"); // 'Incidents' data

    const doc = {
      city: data.city,
      state: data.state,
      severity: data.severity,
      // GeoJSON Point
      location: data.location,
      // To autodelete after 7 days
      timestamp: new Date()
    };

    return await collection.insertOne(doc);
  },

  // Get incidents within a 100 mile radius
  async getNearbyIncidents(lat, lng, radiusInMiles = 100) {
    const db = getDB();
    // Convert miles to meters
    const meters = radiusInMiles * 1609.34;

    return await db.collection("incidents").find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: meters
        }
      }
    }).toArray();
  }
};

module.exports = incidentCollection;