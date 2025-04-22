import React from "react";

const ButtonsTop = ({ onPress, children }) => {
  return (
    <button
      onClick={onPress}
      style={{
        padding: "0.8rem 1.6rem",
        backgroundColor: "#f7931e",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        fontWeight: "600",
        fontSize: "18px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseOver={(e) => {
        e.target.style.transform = "scale(1.05)";
        e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
      }}
    >
      {children}
    </button>
  );
};

export default ButtonsTop;
