import { useParams, Link } from "react-router-dom";
import { concepts } from "../data/modules/concepts";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function ConceptModule() {
  const { topic } = useParams();
  const module = concepts[topic];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!module) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ maxWidth: "896px", margin: "0 auto", padding: "24px" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1f2937" }}>
            Module Not Found
          </h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            No learning module found for "<strong>{topic}</strong>".
          </p>
          <Link
            to="/study-planner"
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#6366f1",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            ← Back to Study Planner
          </Link>
        </div>
      </div>
    );
  }

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: "16px",
  };

  const sectionTitleStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  };

  const sectionTextStyle = {
    fontSize: "15px",
    color: "#374151",
    lineHeight: 1.7,
    margin: 0,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ maxWidth: "896px", margin: "0 auto", padding: "40px 24px" }}>
        <Link
          to="/study-planner"
          style={{
            color: "#6366f1",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "16px",
            display: "inline-block",
          }}
        >
          ← Back to Study Planner
        </Link>

        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1f2937", marginBottom: "24px" }}>
          {module.title}
        </h1>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Explanation</div>
          <p style={sectionTextStyle}>{module.explanation}</p>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Key Idea</div>
          <p style={sectionTextStyle}>{module.keyIdea}</p>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Example</div>
          <p style={sectionTextStyle}>{module.example}</p>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Practice</div>
          <p style={sectionTextStyle}>{module.practice}</p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            marginTop: "8px",
            padding: "10px 20px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Download Module
        </button>
      </div>
    </div>
  );
}

export default ConceptModule;
