import React from "react";

const PendingAdminPage = () => {
  return (
    <div style={styles.container}>
      <h1>Admin Access Pending</h1>
      <p>
        Your admin account is pending approval. For access, please contact us at{" "}
        <a href="mailto:admin@horizonhelp.com">admin@horizonhelp.com</a>.
      </p>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    minHeight: "100vh",
    textAlign: "center",
  },
};

export default PendingAdminPage;