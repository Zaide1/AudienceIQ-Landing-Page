import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FAQ = [
  { q: "What is Reachable Audience?",     a: "A directional estimate of people AudienceIQ thinks are reachable for your product, category, and region. It's a starting hypothesis, not official market-size data." },
  { q: "What is Est. Coverage?",           a: "The share of your reachable audience your current positioning is likely to address first. This is an MVP estimate based on category benchmarks and product specificity." },
  { q: "What is Untapped Opportunity?",    a: "The remaining audience potential outside your early focus. It's calculated by subtracting estimated coverage from your total reachable audience." },
  { q: "What is Confidence?",              a: "How reliable this map is, based on how much onboarding detail you provided, the source quality, and whether live research signals were used." },
  { q: "What is Audience Universe?",       a: "A visual map showing directional slices of your reachable market. Coloured clusters represent audience segments AudienceIQ identified as most relevant." },
  { q: "What does Run live research do?", a: "Searches connected public sources (currently Hacker News) for real audience signals. Results add supporting evidence to your map but source coverage may be limited." },
  { q: "Why are estimates directional?",  a: "Market sizing at the MVP stage is inherently uncertain. These numbers are hypotheses to help you decide where to test first — not guarantees or official statistics." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #F3F4F6" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          padding: "13px 0", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 500, color: "#111827" }}>{q}</span>
        <span style={{ color: "#9CA3AF", fontSize: 16, flexShrink: 0, lineHeight: 1 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65, paddingBottom: 13 }}>
          {a}
        </div>
      )}
    </div>
  );
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const close = useCallback(() => { onClose(); }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label="How it works"
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        style={{
          width: "min(560px, calc(100vw - 40px))",
          maxHeight: "min(640px, calc(100vh - 40px))",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(15,23,42,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>How it works</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>Answers to common questions about your audience map.</div>
        </div>

        <div style={{ overflowY: "auto", padding: "0 28px 24px" }}>
          {FAQ.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
        </div>

        <button
          type="button"
          aria-label="Close"
          onClick={close}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30, borderRadius: "50%",
            background: "#F3F4F6", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.15s",
          }}
        >
          <X size={15} style={{ color: "#6B7280" }} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
