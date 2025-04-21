import React from "react";

const ButtonsTop = ({ onPress, children }) => {
  return (
    <button
      onClick={onPress}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#B42A2A",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: "pointer",
      }}
      onMouseOver={(e) => (e.target.style.opacity = 0.85)}
      onMouseOut={(e) => (e.target.style.opacity = 1)}
    >
      {children}
    </button>
  );
};

export default ButtonsTop;