import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const SECTION_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: "22px 24px",
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

const BODY_STYLE: React.CSSProperties = {
  fontSize: 13.5,
  color: "#374151",
  lineHeight: 1.7,
  margin: 0,
};

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Beta product",
    paragraphs: [
      "Audense is an early-stage beta product. Features, outputs, and pricing may change. By using Audense, you accept that the product is provided as-is and may be updated, paused, or removed at any time.",
    ],
  },
  {
    heading: "How to use Audense",
    paragraphs: [
      "You can use Audense to explore audiences and validation ideas for products you are building or considering.",
      "You agree not to use Audense for unlawful purposes, to harass others, to attempt to break the service, or to scrape or resell the outputs as your own market-research product.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You can run a single research session as a guest. To save history, switch sessions, or run additional research, you'll need to create an account.",
      "You are responsible for keeping your sign-in details safe and for activity under your account.",
    ],
  },
  {
    heading: "What Audense outputs are (and aren't)",
    paragraphs: [
      "Audience numbers, segments, objections, and competitor angles produced by Audense are directional MVP estimates designed to help you decide where to validate first.",
      "They are not official market sizing, financial advice, legal advice, or guaranteed outcomes. You should validate any decision with real users before investing time or money.",
      "When live research is connected, Audense may surface public discussion signals to support your map. Those signals come from third-party sources and may be incomplete or biased.",
    ],
  },
  {
    heading: "Your content",
    paragraphs: [
      "You retain ownership of the inputs you provide and of the outputs Audense generates for your sessions. Audense receives a limited licence to process them for the purpose of running the product.",
      "Don't put confidential third-party material, personal data of others, or anything you don't have the right to share into Audense.",
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      "Audense is provided without warranties of any kind. We don't guarantee that the service will be available, accurate, or fit for a particular purpose.",
      "To the extent permitted by law, Audense and its operators are not liable for indirect or consequential losses arising from your use of the product.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "We may update these terms as the product evolves. Continued use after changes means you accept the updated terms.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about these terms? Reach out from the Help page in the dashboard.",
    ],
  },
];

export default function Terms() {
  const [, navigate] = useLocation();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        padding: "28px 20px 64px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button
          onClick={goBack}
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
            fontFamily: "inherit",
          }}
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Terms
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            The honest agreement for using Audense while it's in beta.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {SECTIONS.map((s) => (
            <div key={s.heading} style={SECTION_STYLE}>
              <div style={HEADING_STYLE}>{s.heading}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {s.paragraphs.map((p, i) => (
                  <p key={i} style={BODY_STYLE}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "8px 0 0", textAlign: "center" }}>
            Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
