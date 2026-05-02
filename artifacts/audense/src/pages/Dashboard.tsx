import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Settings, HelpCircle, Send, Plus, Info, Paperclip,
} from "lucide-react";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

/* ─── Read onboarding data from localStorage ─────────────────────── */
function loadOnboarding() {
  try {
    const raw = localStorage.getItem("audense_onboarding");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/* ─── Dot map logic (reused from DashboardPreview) ──────────────── */
const COLS = 52;
const ROWS = 12;

const TINT1: Record<string, string> = {
  "#7C3AED": "#C4B5FD",
  "#3B82F6": "#93C5FD",
  "#10B981": "#6EE7B7",
  "#F59E0B": "#FDE68A",
  "#EC4899": "#FBCFE8",
};
const TINT2: Record<string, string> = {
  "#7C3AED": "#EDE9FE",
  "#3B82F6": "#DBEAFE",
  "#10B981": "#D1FAE5",
  "#F59E0B": "#FEF3C7",
  "#EC4899": "#FCE7F3",
};
const GREY = "#E5E7EB";

function buildDots(): string[] {
  const dots: string[] = new Array(ROWS * COLS).fill(GREY);
  const set = (r: number, c: number, color: string) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) dots[r * COLS + c] = color;
  };
  const rect = (rA: number, rB: number, cA: number, cB: number, color: string) => {
    for (let r = rA; r <= rB; r++) for (let c = cA; c <= cB; c++) set(r, c, color);
  };
  rect(8, 11, 1,  3,  "#7C3AED");
  rect(6, 11, 4,  7,  "#7C3AED");
  rect(5, 11, 8,  11, "#7C3AED");
  rect(6, 11, 12, 14, "#7C3AED");
  rect(7, 11, 15, 16, "#7C3AED");
  rect(3, 7,  23, 25, "#3B82F6");
  rect(2, 7,  26, 30, "#3B82F6");
  rect(3, 7,  31, 33, "#3B82F6");
  rect(7, 11, 26, 28, "#10B981");
  rect(6, 11, 29, 33, "#10B981");
  rect(7, 11, 34, 36, "#10B981");
  rect(4, 8,  39, 41, "#F59E0B");
  rect(3, 8,  42, 45, "#F59E0B");
  rect(5, 8,  46, 47, "#F59E0B");
  rect(7, 11, 44, 46, "#EC4899");
  rect(6, 11, 47, 50, "#EC4899");
  rect(8, 11, 51, 51, "#EC4899");

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
      if (greyCount === 0) continue;
      const t1 = TINT1[base] ?? base;
      const t2 = TINT2[base] ?? t1;
      if (greyCount === 1) {
        let dir = "to right";
        if      (above) dir = "to top";
        else if (below) dir = "to bottom";
        else if (left)  dir = "to left";
        else if (right) dir = "to right";
        feathered[r * COLS + c] = `linear-gradient(${dir}, ${base} 35%, ${t1} 100%)`;
      } else if (greyCount === 2) {
        feathered[r * COLS + c] = t1;
      } else {
        feathered[r * COLS + c] = t2;
      }
    }
  }
  return feathered;
}

const BASE_DOTS = buildDots();

/* ─── Segment data ────────────────────────────────────────────────── */
interface Segment {
  id: string;
  name: string;
  pct: number;
  range: string;
  bg: string;
  accent: string;
  icon: string;
  pain: string[];
  platforms: string[];
  tooltipLeft: string;
  color: string;
}

const BASE_SEGMENTS: Segment[] = [
  {
    id: "gym",
    name: "Gym Goers",
    pct: 25,
    range: "~210K – 350K",
    bg: "#F5F3FF",
    accent: "#7C3AED",
    icon: "🏋️",
    pain: ["Tracking is tedious", "Forget to log meals"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    tooltipLeft: "14%",
    color: "#7C3AED",
  },
  {
    id: "busy",
    name: "Busy Professionals",
    pct: 30,
    range: "~255K – 420K",
    bg: "#EFF6FF",
    accent: "#3B82F6",
    icon: "💼",
    pain: ["No time to track", "Inconsistent routine"],
    platforms: ["LinkedIn", "X", "Reddit"],
    tooltipLeft: "44%",
    color: "#3B82F6",
  },
  {
    id: "health",
    name: "Health Conscious",
    pct: 20,
    range: "~170K – 280K",
    bg: "#ECFDF5",
    accent: "#10B981",
    icon: "🥗",
    pain: ["Want simplicity", "Hate manual input"],
    platforms: ["Instagram", "YouTube", "Facebook"],
    tooltipLeft: "57%",
    color: "#10B981",
  },
  {
    id: "weight",
    name: "Weight Loss Beginners",
    pct: 15,
    range: "~125K – 210K",
    bg: "#FFF7ED",
    accent: "#F59E0B",
    icon: "⚖️",
    pain: ["Don't know where to start", "Overwhelmed"],
    platforms: ["TikTok", "Instagram", "Reddit"],
    tooltipLeft: "76%",
    color: "#F59E0B",
  },
  {
    id: "nutrition",
    name: "Nutrition Optimisers",
    pct: 10,
    range: "~85K – 140K",
    bg: "#FDF2F8",
    accent: "#EC4899",
    icon: "📊",
    pain: ["Want advanced insights", "Need accuracy"],
    platforms: ["YouTube", "Reddit", "Google"],
    tooltipLeft: "89%",
    color: "#EC4899",
  },
];

/* ─── Message types ───────────────────────────────────────────────── */
interface Message {
  id: number;
  role: "ai" | "user" | "confirm" | "success";
  text: string;
}

/* ─── Dot map component ───────────────────────────────────────────── */
function AudienceMap({
  segments,
  selectedId,
  onSelect,
}: {
  segments: Segment[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = segments.find((s) => s.id === selectedId) ?? segments[0];

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid #F0EDF9",
        borderRadius: 12,
        padding: "14px 16px 12px",
      }}
    >
      {/* Dot grid — width: 100% + overflow: hidden prevents any spill */}
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 4,
          }}
        >
          {BASE_DOTS.map((color, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: "50%",
                background: color,
                minWidth: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Dynamic tooltip — rendered below the grid, not absolute */}
      <div style={{ position: "relative", height: 52 }}>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: selected.tooltipLeft,
            transform: "translateX(-10%)",
            background: "#fff",
            border: `1px solid ${selected.accent}44`,
            borderRadius: 10,
            padding: "8px 12px",
            boxShadow: `0 4px 16px ${selected.accent}22`,
            minWidth: 160,
            pointerEvents: "none",
            transition: "left 0.3s ease",
            zIndex: 2,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
            {selected.pct}% of audience
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: selected.accent, marginTop: 2 }}>
            {selected.range} people
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Nav item ────────────────────────────────────────────────────── */
function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        borderRadius: 8,
        background: active ? "#F5F3FF" : "transparent",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      <span style={{ color: active ? "#7C3AED" : "#6B7280", display: "flex" }}>{icon}</span>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: active ? 600 : 500,
          color: active ? "#7C3AED" : "#374151",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Chat message bubble ─────────────────────────────────────────── */
function Bubble({ msg, onConfirm }: { msg: Message; onConfirm: () => void }) {
  if (msg.role === "confirm") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: `#EDE9FE url(${logoImg}) center/cover no-repeat`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "12px 12px 12px 2px",
              padding: "10px 13px",
              fontSize: 13,
              lineHeight: 1.55,
              color: "#111827",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {msg.text}
          </div>
          <button
            onClick={onConfirm}
            style={{
              alignSelf: "flex-start",
              background: "#7C3AED",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Confirm update →
          </button>
        </div>
      </div>
    );
  }

  if (msg.role === "success") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: `#EDE9FE url(${logoImg}) center/cover no-repeat`,
          }}
        />
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "12px 12px 12px 2px",
            padding: "10px 13px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "#15803D",
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "ai") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: `#EDE9FE url(${logoImg}) center/cover no-repeat`,
          }}
        />
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px 12px 12px 2px",
            padding: "10px 13px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "#111827",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: "#F5F3FF",
          border: "1px solid #DDD6FE",
          borderRadius: "12px 12px 2px 12px",
          padding: "10px 13px",
          fontSize: 13,
          lineHeight: 1.55,
          color: "#4C1D95",
          maxWidth: "82%",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const [, navigate] = useLocation();
  const ob = loadOnboarding();

  const productIdea = ob?.productIdea ?? "AI calorie tracking app";
  const targetUsers = ob?.targetUsers ?? "Busy professionals who want to get healthier";
  const problem = ob?.problem ?? "Manual tracking is hard and time consuming";
  const finalRegion = ob?.finalRegion ?? "United Kingdom";
  const finalCategory = ob?.finalCategory ?? "Health & Fitness";

  const shortRegion = finalRegion.length > 20 ? finalRegion.split(",")[0].trim() : finalRegion;
  const shortIdea = productIdea.length > 40 ? productIdea.slice(0, 38) + "…" : productIdea;

  const [segments, setSegments] = useState<Segment[]>(BASE_SEGMENTS);
  const [selectedId, setSelectedId] = useState("gym");
  const [chatInput, setChatInput] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const msgId = useRef(100);

  const initMessages: Message[] = [
    {
      id: 1,
      role: "ai",
      text: `Hi Founder 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them. Let's start with your product.`,
    },
    {
      id: 2,
      role: "user",
      text: `I'm building ${productIdea}. It's for ${targetUsers}. It solves: ${problem}.`,
    },
    {
      id: 3,
      role: "ai",
      text: `Got it. I've mapped your likely early audience based on your product and launch region.`,
    },
    {
      id: 4,
      role: "user",
      text: `Let's start with ${shortRegion}.`,
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initMessages);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || awaitingConfirm) return;
    setChatInput("");
    const userMsg: Message = { id: ++msgId.current, role: "user", text };
    const aiMsg: Message = {
      id: ++msgId.current,
      role: "confirm",
      text: "I can refine the audience map based on that. Confirm this update?",
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setAwaitingConfirm(true);
  };

  const handleConfirm = () => {
    setAwaitingConfirm(false);
    setSegments((prev) => {
      const delta = 2;
      const first = { ...prev[0], pct: Math.min(prev[0].pct + delta, 40) };
      const rest = prev.slice(1).map((s, i) => ({
        ...s,
        pct: Math.max(s.pct - Math.floor(delta / (prev.length - 1)), 5),
      }));
      return [first, ...rest];
    });
    const successMsg: Message = { id: ++msgId.current, role: "success", text: "✓ Audience map updated." };
    setMessages((prev) => [...prev, successMsg]);
  };

  const CHIPS = [
    "Why wouldn't they use my app?",
    "Where do I find them?",
    "What message works?",
  ];

  const sendChip = (chip: string) => {
    if (awaitingConfirm) return;
    setChatInput("");
    const userMsg: Message = { id: ++msgId.current, role: "user", text: chip };
    const aiMsg: Message = {
      id: ++msgId.current,
      role: "confirm",
      text: "I can refine the audience map based on that. Confirm this update?",
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setAwaitingConfirm(true);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        background: "#F9F8FF",
        overflow: "hidden",
      }}
    >
      {/* ── Left panel ─────────────────────────────────────── */}
      <div
        style={{
          width: 440,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRight: "1px solid #E5E7EB",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "18px 20px 14px",
            borderBottom: "1px solid #F3F4F6",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `#EDE9FE url(${logoImg}) center/cover no-repeat`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.4, color: "#111827" }}>
            Audense
          </span>
        </div>

        {/* "Today" label */}
        <div style={{ padding: "14px 20px 6px", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Today
          </span>
        </div>

        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} onConfirm={handleConfirm} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Prompt chips */}
        <div
          style={{
            padding: "6px 20px 8px",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendChip(chip)}
              disabled={awaitingConfirm}
              style={{
                background: awaitingConfirm ? "#F9FAFB" : "#F5F3FF",
                border: "1px solid #DDD6FE",
                borderRadius: 20,
                padding: "5px 11px",
                fontSize: 11.5,
                fontWeight: 500,
                color: awaitingConfirm ? "#9CA3AF" : "#6D28D9",
                cursor: awaitingConfirm ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div
          style={{
            padding: "10px 20px 8px",
            flexShrink: 0,
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#F9FAFB",
              border: "1.5px solid #E5E7EB",
              borderRadius: 999,
              padding: "7px 7px 7px 14px",
              gap: 8,
              transition: "border-color 0.2s",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED";
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
            }}
          >
            <Paperclip size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Ask your audience anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={awaitingConfirm}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                color: "#111827",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim() || awaitingConfirm}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: !chatInput.trim() || awaitingConfirm ? "#C4B5FD" : "#7C3AED",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !chatInput.trim() || awaitingConfirm ? "not-allowed" : "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <Send size={13} color="#fff" />
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 10.5,
              color: "#9CA3AF",
              marginTop: 6,
              paddingBottom: 4,
            }}
          >
            Audense can make mistakes. Verify important insights.
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ padding: "6px 12px 14px", borderTop: "1px solid #F3F4F6", flexShrink: 0 }}>
          <NavItem icon={<Settings size={15} />} label="Settings" />
          <NavItem icon={<HelpCircle size={15} />} label="Need help? Chat with us" />
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Dashboard header */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              padding: "16px 36px 14px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.4 }}>
                Your Audience
              </h1>
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#7C3AED",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
              New Research
            </button>
          </div>
        </div>

        {/* Main scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "24px 36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              {
                label: "Reachable Audience",
                value: "850K – 1.4M",
                sub: `people in ${shortRegion}`,
                icon: "👥",
                accent: false,
                border: "#E5E7EB",
                valColor: "#111827",
              },
              {
                label: "Est. Coverage",
                value: "7%",
                sub: "~60K people",
                icon: "🎯",
                accent: true,
                border: "#C4B5FD",
                valColor: "#7C3AED",
              },
              {
                label: "Untapped Opportunity",
                value: "93%",
                sub: "~790K – 1.34M people",
                icon: "💡",
                accent: false,
                border: "#FDE68A",
                valColor: "#111827",
              },
              {
                label: "Confidence",
                value: "Medium",
                sub: "Based on available data",
                icon: "📊",
                accent: false,
                border: "#E5E7EB",
                valColor: "#111827",
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "#fff",
                  border: `1px solid ${card.border}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  boxShadow: card.accent
                    ? "0 0 0 3px rgba(124,58,237,0.06), 0 1px 4px rgba(0,0,0,0.04)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>{card.icon}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: card.accent ? "#7C3AED" : "#6B7280",
                    }}
                  >
                    {card.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: card.valColor,
                    letterSpacing: -0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4, fontWeight: 500 }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Audience Universe */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                  Audience Universe
                </span>
                <Info size={13} style={{ color: "#9CA3AF", cursor: "default" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, fontWeight: 600, color: "#6B7280" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#7C3AED",
                      display: "inline-block",
                    }}
                  />
                  Covered 7%
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#E5E7EB",
                      border: "1px solid #D1D5DB",
                      display: "inline-block",
                    }}
                  />
                  Untapped 93%
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 12 }}>
              Each dot represents ~2,000 people in your reachable audience
            </div>
            <AudienceMap
              segments={segments}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Top Audience Segments */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                Top Audience Segments
              </span>
              <Info size={13} style={{ color: "#9CA3AF", cursor: "default" }} />
            </div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 14 }}>
              Click a segment to explore deeper insights
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {segments.map((seg) => {
                const isActive = selectedId === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedId(seg.id)}
                    style={{
                      flex: 1,
                      background: seg.bg,
                      border: `1.5px solid ${isActive ? seg.accent : seg.accent + "33"}`,
                      borderRadius: 12,
                      padding: "14px 12px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      minWidth: 0,
                      boxShadow: isActive
                        ? `0 0 0 3px ${seg.accent}18, 0 2px 8px rgba(0,0,0,0.06)`
                        : "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.18s",
                    }}
                  >
                    {/* Icon + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{ fontSize: 13 }}>{seg.icon}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: seg.accent,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {seg.name}
                      </span>
                    </div>

                    {/* Percentage */}
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: -0.5 }}>
                      {seg.pct}%
                    </div>
                    <div style={{ fontSize: 10.5, color: "#6B7280", fontWeight: 500 }}>{seg.range}</div>

                    {/* Pain points */}
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 4,
                        }}
                      >
                        Top Pain Points
                      </div>
                      {seg.pain.map((p) => (
                        <div
                          key={p}
                          style={{
                            display: "flex",
                            gap: 5,
                            alignItems: "flex-start",
                            marginBottom: 3,
                          }}
                        >
                          <span style={{ color: seg.accent, fontSize: 9, lineHeight: 1.7, flexShrink: 0 }}>•</span>
                          <span style={{ fontSize: 10.5, color: "#374151", lineHeight: 1.45 }}>{p}</span>
                        </div>
                      ))}
                    </div>

                    {/* Platforms */}
                    <div style={{ marginTop: "auto", paddingTop: 6 }}>
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 5,
                        }}
                      >
                        Top Platforms
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {seg.platforms.map((p) => (
                          <span
                            key={p}
                            style={{
                              background: "#fff",
                              border: `1px solid ${seg.accent}33`,
                              borderRadius: 5,
                              padding: "2px 7px",
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
