import { useEffect, useState } from "react";

function SuggestionPopup({ title, message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const containerStyle = {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: `translateX(-50%) translateY(${visible ? "0" : "20px"})`,
    opacity: visible ? 1 : 0,
    transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
    padding: "16px 20px",
    maxWidth: "420px",
    width: "90%",
    zIndex: 1100,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  };

  const closeButtonStyle = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    color: "#6b7280",
  };

  const messageStyle = {
    fontSize: "14px",
    color: "#4b5563",
    margin: 0,
  };

  const actionStyle = {
    marginTop: "8px",
    display: "flex",
    justifyContent: "flex-end",
  };

  const dismissButtonStyle = {
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    color: "#111827",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h4 style={titleStyle}>{title}</h4>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Dismiss suggestion">
          ×
        </button>
      </div>
      <p style={messageStyle}>{message}</p>
      <div style={actionStyle}>
        <button style={dismissButtonStyle} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default SuggestionPopup;

