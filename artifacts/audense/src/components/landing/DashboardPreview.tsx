import { useRef, useEffect, useState } from "react";
import { Users, Focus, Target, CheckCircle2, Send, Sparkles, Plus } from "lucide-react";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

const DESIGN_WIDTH = 980;
const DESIGN_HEIGHT = 620;

function DotGrid() {
  const dots: { color: string }[] = [];
  const COLS = 22;
  const ROWS = 16;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let color = "#E5E7EB";
      // Purple cluster — bottom-left
      if (col < 7 && row > 9) {
        color = Math.random() > 0.25 ? "#7C3AED" : "#A78BFA";
      }
      // Blue/teal cluster — middle-left
      else if (col >= 7 && col < 11 && row >= 5 && row < 10) {
        color = Math.random() > 0.3 ? "#60A5FA" : "#93C5FD";
      }
      // Green cluster — center
      else if (col >= 10 && col < 14 && row >= 6 && row < 12) {
        color = Math.random() > 0.3 ? "#34D399" : "#6EE7B7";
      }
      // Yellow cluster — center-right
      else if (col >= 13 && col < 17 && row >= 4 && row < 9) {
        color = Math.random() > 0.35 ? "#FBBF24" : "#FDE68A";
      }
      // Orange cluster — right
      else if (col >= 16 && row >= 2 && row < 8) {
        color = Math.random() > 0.3 ? "#F97316" : "#FED7AA";
      }
      dots.push({ color });
    }
  }

  return (
    <div className="relative rounded-xl border border-gray-100 overflow-hidden bg-white" style={{ height: 160 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 5,
          padding: "16px 20px",
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: d.color,
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Tooltip */}
      <div
        className="absolute bg-white border border-gray-200 shadow-lg rounded-xl"
        style={{ top: 20, left: 48, padding: "8px 12px", minWidth: 160 }}
      >
        <div className="font-bold text-gray-900" style={{ fontSize: 12 }}>Gym Goers</div>
        <div className="text-gray-500 font-medium" style={{ fontSize: 11, marginTop: 2 }}>25% of audience</div>
        <div className="font-semibold text-[#7C3AED]" style={{ fontSize: 12, marginTop: 2 }}>~210K – 350K people</div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-3 bg-white/95 border border-gray-100 shadow-sm rounded-full"
        style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600 }}
      >
        <span className="flex items-center gap-1">
          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#7C3AED", display: "inline-block" }} />
          Covered 7%
        </span>
        <span className="flex items-center gap-1 text-gray-400">
          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#E5E7EB", display: "inline-block" }} />
          Untapped 93%
        </span>
      </div>
    </div>
  );
}

const segments = [
  { name: "Gym Goers",            pct: "25%", range: "~210K–350K", color: "#7C3AED", platforms: ["Insta", "TikTok", "YouTube"] },
  { name: "Busy Professionals",   pct: "30%", range: "~255K–420K", color: "#3B82F6", platforms: ["LinkedIn", "X"] },
  { name: "Health Conscious",     pct: "20%", range: "~170K–280K", color: "#10B981", platforms: ["Insta", "Facebook"] },
  { name: "Weight Loss Beginners",pct: "15%", range: "~125K–210K", color: "#F59E0B", platforms: ["TikTok", "Reddit"] },
  { name: "Nutrition Optimisers", pct: "10%", range: "~85K–140K",  color: "#F97316", platforms: ["YouTube", "Reddit"] },
];

function DashboardInner() {
  return (
    <div
      style={{
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 25px 60px -12px rgba(124,58,237,0.18), 0 8px 24px -8px rgba(0,0,0,0.1)",
        border: "1px solid #EDE9FE",
      }}
    >
      {/* Title bar */}
      <div style={{ height: 44, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={logoImg} alt="logo" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 4 }} />
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: -0.3 }}>Audense</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FC615D", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FDBC40", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#35CD4B", display: "inline-block" }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT: Chat panel */}
        <div style={{ width: 280, borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", background: "#F9FAFB", flexShrink: 0 }}>
          {/* Chat header */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ background: "#EDE9FE", padding: 4, borderRadius: 6, display: "flex" }}>
              <Sparkles style={{ width: 12, height: 12, color: "#7C3AED" }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 12 }}>Audense AI</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* AI */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles style={{ width: 11, height: 11, color: "#7C3AED" }} />
              </div>
              <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: "12px 12px 12px 2px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                Hi Zaide 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them.
              </div>
            </div>
            {/* User */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: "row-reverse" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, fontWeight: 700, color: "#7C3AED" }}>Z</div>
              <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "12px 12px 2px 12px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#4C1D95" }}>
                I'm building an AI calorie tracking app using photo recognition for people who want to lose weight but hate manual tracking.
              </div>
            </div>
            {/* AI */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles style={{ width: 11, height: 11, color: "#7C3AED" }} />
              </div>
              <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: "12px 12px 12px 2px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                Got it. Who do you think your primary users are?
              </div>
            </div>
            {/* User */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: "row-reverse" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, fontWeight: 700, color: "#7C3AED" }}>Z</div>
              <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "12px 12px 2px 12px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#4C1D95" }}>
                Busy professionals, 20–35, who go to the gym but don't have time to track everything.
              </div>
            </div>
            {/* AI */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles style={{ width: 11, height: 11, color: "#7C3AED" }} />
              </div>
              <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: "12px 12px 12px 2px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                Perfect. Are you targeting any specific country or region first?
              </div>
            </div>
            {/* User */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: "row-reverse" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, fontWeight: 700, color: "#7C3AED" }}>Z</div>
              <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "12px 12px 2px 12px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.55, color: "#4C1D95" }}>
                Let's start with the UK.
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", background: "#fff", borderTop: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#F3F4F6", borderRadius: 999, padding: "6px 10px 6px 14px", gap: 6 }}>
              <span style={{ flex: 1, fontSize: 11, color: "#9CA3AF" }}>Ask anything about your audience...</span>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Send style={{ width: 11, height: 11, color: "#fff", marginLeft: 1 }} />
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: 9.5, color: "#9CA3AF", marginTop: 6, fontWeight: 500 }}>
              Audense can make mistakes. Verify important insights.
            </div>
          </div>
        </div>

        {/* RIGHT: Dashboard */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAFAFA", overflowY: "auto" }}>
          {/* Dashboard header */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Your Audience</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Market insights for AI Calorie Tracker · UK</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#374151", cursor: "default" }}>
              <Plus style={{ width: 11, height: 11 }} /> Export
            </div>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* 4 stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { icon: <Users style={{ width: 13, height: 13 }} />, label: "Reachable Audience", value: "850K–1.4M", sub: "people in the UK", color: "#6B7280", accent: false },
                { icon: <Focus style={{ width: 13, height: 13 }} />, label: "Coverage", value: "7%", sub: "~60K people", color: "#7C3AED", accent: true },
                { icon: <Target style={{ width: 13, height: 13 }} />, label: "Untapped Opportunity", value: "93%", sub: "~790K–1.34M", color: "#F59E0B", accent: false },
                { icon: <CheckCircle2 style={{ width: 13, height: 13 }} />, label: "Confidence", value: "Medium", sub: "Based on available data", color: "#10B981", accent: false },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: c.accent ? "1px solid #DDD6FE" : "1px solid #F3F4F6",
                    borderRadius: 10,
                    padding: "11px 13px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {c.accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#7C3AED" }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: c.color, marginBottom: 7 }}>
                    {c.icon}
                    <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: c.accent ? c.color : "#111827", letterSpacing: -0.5 }}>{c.value}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3, fontWeight: 500 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Dot grid */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 8 }}>Audience Universe</div>
              <DotGrid />
            </div>

            {/* Segment cards */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 8 }}>Top Audience Segments</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {segments.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #F3F4F6",
                      borderRadius: 10,
                      padding: "9px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{s.name}</div>
                        <div style={{ fontSize: 10.5, color: "#6B7280", marginTop: 1 }}>{s.range} people</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: "#F5F3FF", color: "#7C3AED", borderRadius: 5, padding: "2px 7px", fontSize: 10.5, fontWeight: 700 }}>{s.pct}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {s.platforms.map(p => (
                          <span key={p} style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 6px", fontSize: 9.5, fontWeight: 600 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
      const w = el.offsetWidth;
      setScale(w / DESIGN_WIDTH);
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
