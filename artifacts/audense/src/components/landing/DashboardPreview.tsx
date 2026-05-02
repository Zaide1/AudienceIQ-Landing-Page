import { useRef, useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

/* ─── Fixed design dimensions ─────────────────────────────────────── */
const DESIGN_WIDTH  = 980;
const DESIGN_HEIGHT = 730;

/* ─── Dot-grid ─────────────────────────────────────────────────────── */
const COLS = 52;
const ROWS = 12;

type DotColor = string;

// Lighter tints for soft-edge feathering (tier 1: 1–2 grey neighbours)
const TINT1: Record<string, string> = {
  "#7C3AED": "#C4B5FD",
  "#3B82F6": "#93C5FD",
  "#10B981": "#6EE7B7",
  "#F59E0B": "#FDE68A",
  "#EC4899": "#FBCFE8",
};

// Very faint tints (tier 2: 3–4 grey neighbours — corner / isolated edge dots)
const TINT2: Record<string, string> = {
  "#7C3AED": "#EDE9FE",
  "#3B82F6": "#DBEAFE",
  "#10B981": "#D1FAE5",
  "#F59E0B": "#FEF3C7",
  "#EC4899": "#FCE7F3",
};

const GREY = "#E5E7EB";

function buildDots(): DotColor[] {
  // All dots start as uniform grey (untapped universe)
  const dots: DotColor[] = new Array(ROWS * COLS).fill(GREY);

  const set = (r: number, c: number, color: string) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) dots[r * COLS + c] = color;
  };

  // Paint a solid rectangle of full-intensity colour
  const rect = (rA: number, rB: number, cA: number, cB: number, color: string) => {
    for (let r = rA; r <= rB; r++) for (let c = cA; c <= cB; c++) set(r, c, color);
  };

  // ── PURPLE — Gym Goers — large stepped left island ──────────────────
  rect(8, 11, 1,  3,  "#7C3AED"); // left foot
  rect(6, 11, 4,  7,  "#7C3AED"); // left shoulder
  rect(5, 11, 8,  11, "#7C3AED"); // peak
  rect(6, 11, 12, 14, "#7C3AED"); // right shoulder
  rect(7, 11, 15, 16, "#7C3AED"); // right foot taper

  // ── BLUE — Busy Professionals — centre, elevated island ─────────────
  rect(3, 7,  23, 25, "#3B82F6"); // left taper
  rect(2, 7,  26, 30, "#3B82F6"); // main body
  rect(3, 7,  31, 33, "#3B82F6"); // right taper

  // ── GREEN — Health Conscious — lower centre ──────────────────────────
  rect(7, 11, 26, 28, "#10B981"); // left overlap
  rect(6, 11, 29, 33, "#10B981"); // main body
  rect(7, 11, 34, 36, "#10B981"); // right taper

  // ── ORANGE — Weight Loss Beginners — right island ───────────────────
  rect(4, 8,  39, 41, "#F59E0B"); // left taper
  rect(3, 8,  42, 45, "#F59E0B"); // main body
  rect(5, 8,  46, 47, "#F59E0B"); // right taper

  // ── PINK — Nutrition Optimisers — far-right lower island ────────────
  rect(7, 11, 44, 46, "#EC4899"); // left taper
  rect(6, 11, 47, 50, "#EC4899"); // main body
  rect(8, 11, 51, 51, "#EC4899"); // right stub

  // ── Feathering pass ─────────────────────────────────────────────────
  // Checks whether a cell is outside the cluster (grey or out-of-bounds).
  const isGrey = (r: number, c: number) =>
    r < 0 || r >= ROWS || c < 0 || c >= COLS || dots[r * COLS + c] === GREY;

  const feathered = [...dots];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const base = dots[r * COLS + c];
      if (base === GREY) continue;

      const above = isGrey(r - 1, c);
      const below = isGrey(r + 1, c);
      const left  = isGrey(r, c - 1);
      const right = isGrey(r, c + 1);
      const greyCount = [above, below, left, right].filter(Boolean).length;

      if (greyCount === 0) continue; // deep interior — keep full colour

      const t1 = TINT1[base] ?? base;
      const t2 = TINT2[base] ?? t1;

      if (greyCount === 1) {
        // Single open side → directional gradient: full colour on cluster
        // side fading to light tint on the open (grey) side.
        let dir = "to right";
        if      (above) dir = "to top";
        else if (below) dir = "to bottom";
        else if (left)  dir = "to left";
        else if (right) dir = "to right";
        feathered[r * COLS + c] = `linear-gradient(${dir}, ${base} 35%, ${t1} 100%)`;
      } else if (greyCount === 2) {
        // Two open sides → softer solid tint
        feathered[r * COLS + c] = t1;
      } else {
        // 3–4 open sides → very faint (corner / isolated boundary dot)
        feathered[r * COLS + c] = t2;
      }
    }
  }

  return feathered;
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
              background: color,
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
            border: s.accent ? "1px solid #C4B5FD" : `1px solid ${s.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
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
  { role: "ai",   text: "Hi Alex 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them." },
  { role: "user", text: "I'm building an AI calorie tracking app using photo recognition for people who want to lose weight but hate manual tracking." },
  { role: "ai",   text: "Got it. Who do you think your primary users are?" },
  { role: "user", text: "Busy professionals, 20–35, who go to the gym but don't have time to track everything." },
  { role: "ai",   text: "Perfect. Are you targeting any specific country or region first?" },
  { role: "user", text: "Let's start with the UK." },
];

function ChatPanel() {
  return (
    <div style={{ width: 268, borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflow: "hidden", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
        {MESSAGES.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "ai" ? (
              <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid #EDE9FE" }}>
                <img src={logoImg} alt="Audense AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : null}
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
        <div style={{ display: "flex", alignItems: "center", background: "#F3F4F6", borderRadius: 999, padding: "4px 4px 4px 12px", gap: 6 }}>
          <span style={{ flex: 1, fontSize: 10.5, color: "#9CA3AF" }}>Ask anything about your audience...</span>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send style={{ width: 11, height: 11, color: "#fff" }} />
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
      <div style={{ padding: "10px 18px", flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Your Audience</div>
        <div style={{ fontSize: 10.5, color: "#6B7280", marginTop: 2 }}>Market insights for AI Calorie Tracker · UK</div>
      </div>

      {/* Content — no scroll */}
      <div style={{ flex: 1, padding: "12px 18px 10px", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
        <StatCards />

        {/* Audience Universe */}
        <div>
          {/* Row 1: title + ℹ on left, legend on right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>Audience Universe</span>
              <span style={{ fontSize: 10, color: "#9CA3AF", cursor: "default", lineHeight: 1 }} title="Visual map of your reachable audience">ⓘ</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9.5, fontWeight: 600, color: "#6B7280" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", display: "inline-block", flexShrink: 0 }} />
                Covered 7%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E5E7EB", border: "1px solid #D1D5DB", display: "inline-block", flexShrink: 0 }} />
                Untapped 93%
              </span>
            </div>
          </div>
          {/* Row 2: subtitle */}
          <div style={{ fontSize: 9.5, color: "#9CA3AF", marginBottom: 6 }}>
            Each dot represents ~2,000 people in your reachable audience
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
