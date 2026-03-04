import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { studyCurriculum } from "../data/studyCurriculum";

function StudyPlanner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  };

  const headerStyle = {
    padding: "18px 20px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  };

  const contentStyle = {
    padding: "20px",
  };

  const topicRowStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "8px",
    marginBottom: "8px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  };

  const linkStyle = {
    flexShrink: 0,
    padding: "6px 14px",
    backgroundColor: "#6366f1",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "8px", color: "#1f2937", fontSize: "28px" }}>
          📚 Study Planner
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "28px", fontSize: "15px", lineHeight: 1.6 }}>
          Unit-based curriculum from beginner to advanced. Click any topic to review it in the Lunar Lumina Learning Module.
        </p>

        {studyCurriculum.map((section) => {
          const isExpanded = expandedCategory === section.id;
          return (
            <div key={section.id} style={cardStyle}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedCategory(isExpanded ? null : section.id)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  setExpandedCategory(isExpanded ? null : section.id)
                }
                style={{
                  ...headerStyle,
                  backgroundColor: isExpanded ? "#eef2ff" : "#fafafa",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = "#fafafa";
                }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", color: "#374151", fontWeight: 600 }}>
                  {section.category}
                </h2>
                <span style={{ fontSize: "20px", color: "#6b7280", fontWeight: 300 }}>
                  {isExpanded ? "−" : "+"}
                </span>
              </div>

              {isExpanded && (
                <div style={contentStyle}>
                  {section.topics.map((topic, idx) => (
                    <div
                      key={idx}
                      style={topicRowStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>
                          {idx + 1}. {topic.name}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>
                          {topic.description}
                        </div>
                      </div>
                      <a
                        href={topic.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#4f46e5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#6366f1";
                        }}
                      >
                        Study →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div
          style={{
            ...cardStyle,
            backgroundColor: "#f0fdf4",
            borderColor: "#86efac",
            padding: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", color: "#166534" }}>💡 Tips</h3>
          <ul style={{ color: "#15803d", paddingLeft: "20px", margin: 0, lineHeight: 1.8 }}>
            <li>Follow topics in order within each category for best progression.</li>
            <li>Take a quiz after completing a section to reinforce learning.</li>
            <li>Check your Performance page for a personalized weak-topic study plan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudyPlanner;
