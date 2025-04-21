// Test file for incidents db creation and implementation, remove later

const { connectToServer, getDB } = require("./connect");

async function testIncidents() {
  try {
    await connectToServer();
    const db = getDB();
    const collection = db.collection("incidents");

    await collection.insertMany([
      {
        city: "San Francisco",
        severity: "critical",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749] // [lng, lat]
        },
        timestamp: new Date()
      },
      {
        city: "Berkeley",
        severity: "high",
        location: {
          type: "Point",
          coordinates: [-122.2730, 37.8715]
        },
        timestamp: new Date()
      },
      {
        city: "Oakland",
        severity: "moderate",
        location: {
          type: "Point",
          coordinates: [-122.2711, 37.8044]
        },
        timestamp: new Date()
      },
      {
        city: "San Mateo",
        severity: "low",
        location: {
          type: "Point",
          coordinates: [-122.3255, 37.5629]
        },
        timestamp: new Date()
      }
    ]);

    console.log("✅ Test incidents inserted.");
    process.exit();
  } catch (err) {
    console.error(" Failed to seed test incidents:", err);
    process.exit(1);
  }
}

testIncidents();
