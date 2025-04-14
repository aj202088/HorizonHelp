// src/pages/DashboardPage.jsx
const DashboardPage = () => {
    return (
      <div style={{ color: "white", padding: "2rem" }}>
        <h1>Welcome to the Dashboard</h1>
        <p>This is the homepage after a successful login.</p>
     
        {/* Map Component Integration */}
        <div style={{ marginTop: "2rem" }}>
          <MapComponent />
        </div>
      </div>
    );
  };
  
  export default DashboardPage;
  