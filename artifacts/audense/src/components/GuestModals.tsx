import React from "react";

/* ─── Guest-mode modal set ────────────────────────────────────────── */

interface BaseProps {
  onPrimary:   () => void;
  onSecondary: () => void;
}

/* shared overlay + card container */
function GuestModal({
  title, body, primaryLabel, secondaryLabel, onPrimary, onSecondary,
}: BaseProps & { title: string; body: string; primaryLabel: string; secondaryLabel: string }) {
  const cardStyle: React.CSSProperties = {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 9200, width: 400, maxWidth: "calc(100vw - 40px)",
    background: "#fff", borderRadius: 18,
    boxShadow: "0 28px 72px rgba(15,23,42,0.20)",
    padding: "32px 28px 28px",
    fontFamily: "Inter, sans-serif",
    textAlign: "center",
  };

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9199, background: "rgba(0,0,0,0.32)" }}
        onClick={onSecondary}
      />
      <div style={cardStyle}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px", fontSize: 22,
        }}>💾</div>

        <div style={{ fontSize: 17.5, fontWeight: 700, color: "#111827", marginBottom: 10, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
          {body}
        </div>

        <button
          onClick={onPrimary}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 10,
            background: "#7C3AED", color: "#fff", border: "none",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            marginBottom: 10, fontFamily: "Inter, sans-serif",
          }}
        >
          {primaryLabel}
        </button>
        <button
          onClick={onSecondary}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10,
            background: "#F3F4F6", color: "#374151", border: "none",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {secondaryLabel}
        </button>
      </div>
    </>
  );
}

/* ── 1. Soft "Save your research" prompt ─────────────────────────── */
export function SoftPromptModal({ onPrimary, onSecondary }: BaseProps) {
  return (
    <GuestModal
      title="Save your research"
      body="Your audience map is getting smarter. Create a free account to save this chat, research history, and future updates."
      primaryLabel="Create free account"
      secondaryLabel="Keep exploring"
      onPrimary={onPrimary}
      onSecondary={onSecondary}
    />
  );
}

/* ── 2. New Research auth wall ───────────────────────────────────── */
export function NewResearchAuthWall({ onPrimary, onSecondary }: BaseProps) {
  return (
    <GuestModal
      title="Save this research before starting another"
      body="Create a free account to keep this audience map, chat, and insights. Then you can start a new research project without losing anything."
      primaryLabel="Create free account"
      secondaryLabel="Cancel"
      onPrimary={onPrimary}
      onSecondary={onSecondary}
    />
  );
}

