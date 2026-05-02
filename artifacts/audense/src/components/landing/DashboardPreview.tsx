import { useRef, useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

/* ─── Fixed design dimensions ─────────────────────────────────────── */
const DESIGN_WIDTH  = 980;
const DESIGN_HEIGHT = 730;

/* ─── Dot-grid ─────────────────────────────────────────────────────── */
const COLS = 28;
const ROWS = 14;

type DotColor = string;

function buildDots(): DotColor[] {
  const dots: DotColor[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let color = "#E5E7EB"; // untapped grey

      // Purple cluster — bottom-left
      if (c < 6 && r >= ROWS - 5) {
        color = Math.random() > 0.2 ? "#7C3AED" : "#A78BFA";
      }
      // Blue cluster — left-center
      else if (c >= 5 && c < 9 && r >= 5 && r < ROWS - 2) {
        color = Math.random() > 0.35 ? "#3B82F6" : "#93C5FD";
      }
      // Green cluster — center
      else if (c >= 9 && c < 14 && r >= 4 && r < ROWS - 1) {
        color = Math.random() > 0.3 ? "#10B981" : "#6EE7B7";
      }
      // Orange/yellow cluster — center-right
      else if (c >= 14 && c < 19 && r >= 2 && r < ROWS - 2) {
        color = Math.random() > 0.3 ? "#F59E0B" : "#FDE68A";
      }
      // Pink cluster — right
      else if (c >= 19 && r >= 1 && r < ROWS - 1) {
        color = Math.random() > 0.3 ? "#EC4899" : "#FBCFE8";
      }

      dots.push(color);
    }
  }
  return dots;
}

// Build once, outside component so it's stable across renders
const DOTS = buildDots();

function DotGrid() {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid #F0EDF9",
        borderRadius: 10,
        padding: "12px 14px",
        overflow: "hidden",
      }}
    >
      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 9.5,
          fontWeight: 600,
          color: "#6B7280",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", display: "inline-block" }} />
          Covered 7%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E5E7EB", display: "inline-block" }} />
          Untapped 93%
        </span>
      </div>

      {/* Dot grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 5,
          marginTop: 4,
        }}
      >
        {DOTS.map((color, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Tooltip over purple cluster */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 16,
          background: "#fff",
          border: "1px solid #EDE9FE",
          borderRadius: 10,
          padding: "7px 11px",
          boxShadow: "0 4px 12px rgba(124,58,237,0.12)",
          minWidth: 155,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 11, color: "#111827" }}>Gym Goers</div>
        <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>25% of audience</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", marginTop: 2 }}>~210K – 350K people</div>
      </div>
    </div>
  );
}

/* ─── Segment cards ─────────────────────────────────────────────────── */
const SEGMENTS = [
  {
    name: "Gym Goers",
    pct: "25%",
    range: "~210K – 350K",
    bg: "#F5F3FF",
    accent: "#7C3AED",
    icon: "🏋️",
    pain: ["Tracking is tedious", "Forget to log meals"],
    platforms: ["Insta", "TikTok", "YouTube"],
  },
  {
    name: "Busy Professionals",
    pct: "30%",
    range: "~255K – 420K",
    bg: "#EFF6FF",
    accent: "#3B82F6",
    icon: "💼",
    pain: ["No time to track", "Inconsistent routine"],
    platforms: ["LinkedIn", "X", "Reddit"],
  },
  {
    name: "Health Conscious",
    pct: "20%",
    range: "~170K – 280K",
    bg: "#ECFDF5",
    accent: "#10B981",
    icon: "🥗",
    pain: ["Want simplicity", "Hate manual input"],
    platforms: ["Insta", "YouTube", "Facebook"],
  },
  {
    name: "Weight Loss Beginners",
    pct: "15%",
    range: "~125K – 210K",
    bg: "#FFF7ED",
    accent: "#F59E0B",
    icon: "⚖️",
    pain: ["Don't know where to start", "Overwhelmed"],
    platforms: ["TikTok", "Instagram", "Reddit"],
  },
  {
    name: "Nutrition Optimisers",
    pct: "10%",
    range: "~85K – 140K",
    bg: "#FDF2F8",
    accent: "#EC4899",
    icon: "📊",
    pain: ["Want advanced insights", "Need accuracy"],
    platforms: ["YouTube", "Reddit", "Google"],
  },
];

function SegmentCards() {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {SEGMENTS.map((s) => (
        <div
          key={s.name}
          style={{
            flex: 1,
            background: s.bg,
            border: `1px solid ${s.accent}22`,
            borderRadius: 10,
            padding: "10px 10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 0,
          }}
        >
          {/* Icon + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11 }}>{s.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: s.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
          </div>

          {/* Percentage */}
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{s.pct}</div>
          <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 500 }}>{s.range}</div>

          {/* Pain points */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Key Pain Points</div>
            {s.pain.map((p) => (
              <div key={p} style={{ display: "flex", gap: 4, alignItems: "flex-start", marginBottom: 2 }}>
                <span style={{ color: s.accent, fontSize: 8, lineHeight: 1.5, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Platforms */}
          <div style={{ marginTop: "auto", paddingTop: 4 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Top Platforms</div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {s.platforms.map((p) => (
                <span
                  key={p}
                  style={{
                    background: "#fff",
                    border: `1px solid ${s.accent}33`,
                    borderRadius: 4,
                    padding: "1px 5px",
                    fontSize: 8.5,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Stat cards ────────────────────────────────────────────────────── */
const STATS = [
  { label: "Reachable Audience", value: "850K–1.4M", sub: "people in the UK",       icon: "👥", color: "#6B7280", border: "#F3F4F6", accent: false },
  { label: "Coverage",           value: "7%",         sub: "~60K people",            icon: "🎯", color: "#7C3AED", border: "#DDD6FE", accent: true  },
  { label: "Untapped Opportunity",value: "93%",        sub: "~790K – 1.34M people",  icon: "💡", color: "#F59E0B", border: "#FEF3C7", accent: false },
  { label: "Confidence",         value: "Medium",     sub: "Based on available data", icon: "✅", color: "#10B981", border: "#D1FAE5", accent: false },
];

function StatCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
      {STATS.map((s) => (
        <div
          key={s.label}
          style={{
            background: "#fff",
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {s.accent && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#7C3AED" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
            <span style={{ fontSize: 11 }}>{s.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: s.color }}>{s.label}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: s.accent ? s.color : "#111827", letterSpacing: -0.3 }}>{s.value}</div>
          <div style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 3, fontWeight: 500 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Chat panel ────────────────────────────────────────────────────── */
const MESSAGES = [
  { role: "ai",   text: "Hi Zaide 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them." },
  { role: "user", text: "I'm building an AI calorie tracking app using photo recognition for people who want to lose weight but hate manual tracking." },
  { role: "ai",   text: "Got it. Who do you think your primary users are?" },
  { role: "user", text: "Busy professionals, 20–35, who go to the gym but don't have time to track everything." },
  { role: "ai",   text: "Perfect. Are you targeting any specific country or region first?" },
  { role: "user", text: "Let's start with the UK." },
];

function ChatPanel() {
  return (
    <div style={{ width: 268, borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", background: "#F9FAFB", flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ background: "#EDE9FE", padding: 4, borderRadius: 6, display: "flex" }}>
          <Sparkles style={{ width: 11, height: 11, color: "#7C3AED" }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 12 }}>Audense AI</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "hidden", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
        {MESSAGES.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "ai" ? (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles style={{ width: 10, height: 10, color: "#7C3AED" }} />
              </div>
            ) : (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 8, fontWeight: 700, color: "#7C3AED" }}>Z</div>
            )}
            <div
              style={{
                background: m.role === "ai" ? "#fff" : "#F5F3FF",
                border: m.role === "ai" ? "1px solid #F3F4F6" : "1px solid #DDD6FE",
                borderRadius: m.role === "ai" ? "10px 10px 10px 2px" : "10px 10px 2px 10px",
                padding: "8px 10px",
                fontSize: 11,
                lineHeight: 1.5,
                color: m.role === "ai" ? "#111827" : "#4C1D95",
                boxShadow: m.role === "ai" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 10px", background: "#fff", borderTop: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#F3F4F6", borderRadius: 999, padding: "5px 8px 5px 12px", gap: 6 }}>
          <span style={{ flex: 1, fontSize: 10.5, color: "#9CA3AF" }}>Ask anything about your audience...</span>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send style={{ width: 10, height: 10, color: "#fff", marginLeft: 1 }} />
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 9, color: "#9CA3AF", marginTop: 5, fontWeight: 500 }}>
          Audense can make mistakes. Verify important insights.
        </div>
      </div>
    </div>
  );
}

/* ─── Right dashboard panel ─────────────────────────────────────────── */
function DashboardPanel() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAFAFA", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Your Audience</div>
          <div style={{ fontSize: 10.5, color: "#6B7280", marginTop: 2 }}>Market insights for AI Calorie Tracker · UK</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #E5E7EB", borderRadius: 7, padding: "4px 9px", fontSize: 10.5, fontWeight: 600, color: "#374151", background: "#fff" }}>
          + Export Data
        </div>
      </div>

      {/* Content — no scroll */}
      <div style={{ flex: 1, padding: "12px 18px 10px", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
        <StatCards />

        {/* Audience Universe */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>Audience Universe</span>
            <span style={{ fontSize: 9.5, color: "#9CA3AF" }}>Each dot ≈ 2,000 people in your reachable audience</span>
          </div>
          <DotGrid />
        </div>

        {/* Top Audience Segments */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#111827", marginBottom: 6 }}>Top Audience Segments</div>
          <SegmentCards />
        </div>
      </div>
    </div>
  );
}

/* ─── Outer wrapper with CSS-scale ──────────────────────────────────── */
function DashboardInner() {
  return (
    <div
      style={{
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 28px 60px -12px rgba(124,58,237,0.18), 0 8px 24px -8px rgba(0,0,0,0.10)",
        border: "1px solid #EDE9FE",
      }}
    >
      {/* Title bar */}
      <div style={{ height: 40, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", padding: "0 14px", justifyContent: "space-between", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <img src={logoImg} alt="logo" style={{ width: 18, height: 18, objectFit: "contain", borderRadius: 4 }} />
          <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: -0.2 }}>Audense</span>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FC615D", display: "inline-block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FDBC40", display: "inline-block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#35CD4B", display: "inline-block" }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ChatPanel />
        <DashboardPanel />
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setScale(el.offsetWidth / DESIGN_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: DESIGN_HEIGHT * scale, position: "relative" }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <DashboardInner />
      </div>
    </div>
  );
}
