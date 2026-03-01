import { getConceptLinksForText } from "../utils/studyPlanUtils";

/**
 * Renders a unified study plan with concept resource links injected below it.
 * Links are derived from conceptResources only (no AI-generated URLs).
 */
function StudyPlanWithLinks({ studyPlan }) {
  if (!studyPlan || typeof studyPlan !== "object") return null;

  const days = [
    { key: "day1", label: "Day 1" },
    { key: "day2", label: "Day 2" },
    { key: "day3", label: "Day 3" },
  ];

  const linkStyle = {
    marginLeft: "8px",
    fontSize: "13px",
    color: "#6366f1",
    textDecoration: "none",
  };

  const blocks = days
    .map(({ key }) => {
      const altKey = "Day" + key.slice(-1);
      const raw = studyPlan[key] ?? studyPlan[altKey];
      if (raw == null || raw === "") return "";
      return String(raw).trim();
    })
    .filter(Boolean);

  if (blocks.length === 0) return null;

  const unifiedPlanText = blocks.join("\n\n");
  const planLines = unifiedPlanText.split(/\r?\n/);

  return (
    <div style={{ marginBottom: "12px" }}>
      <h3>Study Plan</h3>
      <div style={{ marginBottom: "4px" }}>
        {planLines.map((line, index) => {
          const lineText = String(line || "");
          const lineLinks = getConceptLinksForText(lineText);
          const isBlank = lineText.trim() === "";

          return (
            <div key={`line-${index}`} style={{ marginBottom: isBlank ? "8px" : "4px" }}>
              <span style={{ whiteSpace: "pre-wrap" }}>{lineText}</span>
              {!isBlank &&
                lineLinks.map(({ concept, url }) => (
                  <a
                    key={`${index}-${concept}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    {concept}
                  </a>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudyPlanWithLinks;
