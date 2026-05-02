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
    heading: "What this is",
    paragraphs: [
      "Audense is an early-stage product that helps founders explore who their audience might be. This page explains, in plain language, what data Audense collects when you use it and what we do with it.",
      "Audense is in beta. The product, the data we store, and this policy may evolve as we learn what founders need.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "Account data: if you sign up, we store your email and a unique account id so you can log in and keep your work.",
      "Research inputs: the product description, audience goals, region, and other inputs you provide during onboarding and chat.",
      "Generated outputs: the audience map, segments, and chat history produced by Audense for your sessions.",
      "Usage data: basic technical information such as the pages you visit inside Audense and any errors the app encounters, used to keep the product working.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "To run the product: we use your inputs to generate your audience map, segments, and chat replies.",
      "To save your work: signed-in accounts can keep research history and switch between sessions.",
      "To improve the product: we may review aggregate, non-identifying patterns to make Audense more useful for founders.",
      "We do not sell your data, and we do not share your research inputs or outputs with third parties for advertising.",
    ],
  },
  {
    heading: "Guest sessions",
    paragraphs: [
      "If you use Audense without an account, your research is stored only in your browser. Clearing your browser data will remove it.",
      "When you create an account, Audense can migrate your active guest session into your account so you don't lose your work.",
    ],
  },
  {
    heading: "Third-party services",
    paragraphs: [
      "Audense uses standard infrastructure providers for hosting, authentication, and database storage. These providers process data on our behalf under their own security and privacy commitments.",
      "When live research is connected, Audense may query public discussion sources to surface signals relevant to your audience. It does not share your private inputs with those sources beyond what is necessary to perform the lookup.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can delete a research session from your dashboard at any time.",
      "You can sign out to clear local session data from this device.",
      "If you want your account and stored research deleted, contact us and we will remove it.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about this policy or your data? Reach out from the Help page in the dashboard. As a beta product, we read every message.",
    ],
  },
];

export default function Privacy() {
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
            Privacy
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            How Audense handles your data. Plain language, no surprises.
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
