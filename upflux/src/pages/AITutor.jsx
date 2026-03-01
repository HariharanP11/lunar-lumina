import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

function AITutor() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoadingProfile(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } catch (err) {
        console.error("AI Tutor profile fetch error:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  const learningProfile = profile?.learningProfile || {};
  const weakTopics = learningProfile.weakTopics || [];
  const learningVelocity = learningProfile.learningVelocity ?? null;
  const riskLevel = learningProfile.riskLevel || "Unknown";

  const handleAsk = async () => {
    setError("");
    setReply("");
    if (!message.trim()) {
      setError("Please type a question for the AI tutor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          weakTopics,
          learningVelocity,
          riskLevel,
        }),
      });
      const data = await res.json();
      setReply(data?.reply || "AI Tutor is temporarily unavailable.");
    } catch (err) {
      console.error("AI Tutor request error:", err);
      setReply("AI Tutor is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    padding: "24px",
  };

  const inputStyle = {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    resize: "vertical",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const buttonStyle = {
    marginTop: "12px",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.7,
    cursor: "default",
  };

  const profilePillStyle = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    fontSize: "12px",
    marginRight: "8px",
    marginBottom: "4px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>AI Tutor</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Ask questions about your weak topics. The tutor uses your learning profile for context.
        </p>

        {!loadingProfile && (
          <div style={{ marginBottom: "16px" }}>
            {weakTopics.length > 0 && (
              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Weak Topics:</span>{" "}
                {weakTopics.map((t) => (
                  <span key={t} style={profilePillStyle}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Velocity:</span>{" "}
              <span style={profilePillStyle}>
                {learningVelocity == null ? "N/A" : learningVelocity}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Risk:</span>{" "}
              <span style={profilePillStyle}>{riskLevel}</span>
            </div>
          </div>
        )}

        <textarea
          style={inputStyle}
          placeholder="Type your question here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && (
          <p style={{ color: "#b91c1c", fontSize: "13px", marginTop: "6px" }}>{error}</p>
        )}
        <button
          type="button"
          style={loading ? disabledButtonStyle : buttonStyle}
          onClick={handleAsk}
          disabled={loading}
        >
          {loading ? "Asking AI Tutor..." : "Ask Tutor"}
        </button>

        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <div
            style={{
              minHeight: "80px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              whiteSpace: "pre-wrap",
              fontSize: "14px",
            }}
          >
            {loading ? "Thinking..." : reply || "No response yet."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AITutor;

