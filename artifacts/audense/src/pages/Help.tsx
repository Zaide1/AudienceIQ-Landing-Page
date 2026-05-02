import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const SECTION_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: "20px 22px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const HEADING_STYLE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
  marginBottom: 14,
  paddingBottom: 10,
  borderBottom: "1px solid #F3F4F6",
};

const ITEM_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#7C3AED",
  marginBottom: 3,
};

const ITEM_BODY_STYLE: React.CSSProperties = {
  fontSize: 13.5,
  color: "#374151",
  lineHeight: 1.6,
};

const BULLET_STYLE: React.CSSProperties = {
  fontSize: 13.5,
  color: "#374151",
  lineHeight: 1.7,
  paddingLeft: 16,
  position: "relative" as const,
};

function MetricItem({ label, body }: { label: string; body: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={ITEM_LABEL_STYLE}>{label}</div>
      <div style={ITEM_BODY_STYLE}>{body}</div>
    </div>
  );
}

export default function Help() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        padding: "28px 20px 48px",
        maxWidth: 720,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          padding: "4px 0",
          fontSize: 13.5,
          fontWeight: 500,
          color: "#6B7280",
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </button>

      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: -0.4 }}>
          Help &amp; guidance
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Everything you need to understand your Audense audience map.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* How Audense estimates your audience */}
        <div style={SECTION_STYLE}>
          <div style={HEADING_STYLE}>How Audense estimates your audience</div>
          <MetricItem
            label="Reachable Audience"
            body="Directional estimate of people Audense thinks are reachable for this product, category, and region."
          />
          <MetricItem
            label="Estimated Coverage"
            body="The share of your reachable audience your current positioning is likely to address first. This is an MVP estimate, not an official statistic."
          />
          <MetricItem
            label="Untapped Opportunity"
            body="The remaining audience potential outside your current early focus. Calculated from reachable audience minus estimated coverage."
          />
          <MetricItem
            label="Confidence"
            body="How reliable this map is based on onboarding detail, source quality, live research availability, and signal strength."
          />
          <MetricItem
            label="Audience Universe"
            body="Each dot represents a slice of your estimated reachable market. Coloured clusters show priority audience segments."
          />
          <MetricItem
            label="Top Audience Segments"
            body="Your strongest audience groups ranked by fit, urgency, reachability, and likely response to your positioning."
          />
          <MetricItem
            label="Live Research"
            body="Searches connected public sources for evidence-backed audience signals. Source coverage may be limited."
          />
        </div>

        {/* What the numbers mean */}
        <div style={SECTION_STYLE}>
          <div style={HEADING_STYLE}>What the numbers mean</div>
          <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.7, margin: 0 }}>
            These are directional audience estimates designed to help you choose where to test first. They are not
            official market-size statistics. When live research is enabled, Audense can use connected public sources
            as supporting signals, but source coverage may be limited and skewed depending on the product category.
          </p>
        </div>

        {/* How to use the map */}
        <div style={SECTION_STYLE}>
          <div style={HEADING_STYLE}>How to use the map</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Start with the largest high-fit segment, not necessarily the biggest theoretical market.",
              "Use the chat to ask where to find a segment, what message to test, and what objections to expect.",
              "Use live research when you want supporting public signals.",
              "Treat the first map as a starting hypothesis, then refine it as you learn.",
            ].map((tip) => (
              <li key={tip} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#7C3AED",
                    flexShrink: 0,
                    marginTop: 7,
                  }}
                />
                <span style={BULLET_STYLE}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
