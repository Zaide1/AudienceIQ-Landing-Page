import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Settings, HelpCircle, Send, Plus, Paperclip,
} from "lucide-react";
import {
  FaInstagram, FaTiktok, FaYoutube, FaLinkedin,
  FaXTwitter, FaReddit, FaFacebook, FaGoogle,
} from "react-icons/fa6";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";
import { SettingsModal } from "../components/SettingsModal";
import { HelpModal } from "../components/HelpModal";
import { SupportModal } from "../components/SupportModal";
import {
  loadAudienceMap, generateMockAudienceMap, saveAudienceMap, formatK,
  type AudienceMapResult, type ResearchSignal,
} from "../lib/audienceMap";

/* ─── Platform icon map ───────────────────────────────────────────── */
type IconComponent = React.ComponentType<{ size?: number | string }>;

const PLATFORM_ICONS: Record<string, { Icon: IconComponent; color: string }> = {
  Instagram: { Icon: FaInstagram, color: "#E1306C" },
  TikTok:    { Icon: FaTiktok,    color: "#010101" },
  YouTube:   { Icon: FaYoutube,   color: "#FF0000" },
  LinkedIn:  { Icon: FaLinkedin,  color: "#0A66C2" },
  X:         { Icon: FaXTwitter,  color: "#000000" },
  Reddit:    { Icon: FaReddit,    color: "#FF4500" },
  Facebook:  { Icon: FaFacebook,  color: "#1877F2" },
  Google:    { Icon: FaGoogle,    color: "#4285F4" },
};

function PlatformIcon({ name }: { name: string }) {
  const entry = PLATFORM_ICONS[name];
  if (!entry) return null;
  const { Icon, color } = entry;
  return (
    <span
      title={name}
      aria-label={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: "#fff",
        border: "1px solid #E5E7EB",
        color,
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      <Icon />
    </span>
  );
}

/* ─── Read onboarding data from localStorage ─────────────────────── */
function loadOnboarding() {
  try {
    const raw = localStorage.getItem("audense_onboarding");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/* ─── Chat message persistence ───────────────────────────────────── */
const CHAT_KEY = "audense-chat-messages";

function buildGreeting(displayName: string): Message {
  return {
    id: 1,
    role: "ai",
    text: `Hi ${displayName} 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them. Let's start with your product.`,
  };
}

function loadChatMessages(displayName: string): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [buildGreeting(displayName)];
}

function saveChatMessages(msgs: Message[]): void {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs)); } catch {}
}

/* ─── Segment colour mappings ────────────────────────────────────── */
const COLOR_ACCENT: Record<string, string> = {
  purple: "#7C3AED",
  blue:   "#3B82F6",
  green:  "#10B981",
  orange: "#F59E0B",
  pink:   "#EC4899",
};
const COLOR_BG: Record<string, string> = {
  purple: "#F5F3FF",
  blue:   "#EFF6FF",
  green:  "#ECFDF5",
  orange: "#FFF7ED",
  pink:   "#FDF2F8",
};
const DOT_IDS       = ["gym", "busy", "health", "weight", "nutrition"];
const TOOLTIP_LEFTS = ["14%", "44%", "57%", "76%", "89%"];
const SEG_ICONS     = ["🏋️", "💼", "🥗", "⚖️", "📊"];

function buildSegmentsFromMap(map: AudienceMapResult): Segment[] {
  return map.segments.slice(0, 5).map((s, i) => ({
    id:          DOT_IDS[i],
    name:        s.name,
    pct:         s.percent,
    range:       `~${formatK(s.audienceMin)} – ${formatK(s.audienceMax)}`,
    bg:          COLOR_BG[s.color]     ?? "#F5F3FF",
    accent:      COLOR_ACCENT[s.color] ?? "#7C3AED",
    icon:        SEG_ICONS[i],
    pain:        s.painPoints,
    platforms:   s.platforms,
    tooltipLeft: TOOLTIP_LEFTS[i],
    color:       COLOR_ACCENT[s.color] ?? "#7C3AED",
  }));
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
const GREY = "#ECEEF2";

/* Fixed cluster centres + base radii (calibrated to look correct at each
   segment's default percentage when scale = 0.75 + pct/40, clamped 0.8–1.45) */
const CLUSTERS = [
  { color: "#7C3AED", cx:  8.0, cy: 8.5, baseRx: 5.5, baseRy: 3.2 }, // purple  – left
  { color: "#3B82F6", cx: 28.0, cy: 4.5, baseRx: 3.5, baseRy: 1.8 }, // blue    – upper-mid
  { color: "#10B981", cx: 31.0, cy: 8.5, baseRx: 4.0, baseRy: 2.0 }, // green   – lower-mid
  { color: "#F59E0B", cx: 43.0, cy: 5.5, baseRx: 3.5, baseRy: 2.2 }, // orange  – upper-right
  { color: "#EC4899", cx: 47.5, cy: 8.5, baseRx: 3.5, baseRy: 2.5 }, // pink    – lower-right
] as const;

function clampN(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* Builds dot arrays driven by each segment's pct — same inputs → same output */
function buildDynamicDots(segments: Segment[]): { feathered: string[]; raw: string[] } {
  const dots: string[] = new Array(ROWS * COLS).fill(GREY);

  segments.forEach((seg, i) => {
    if (i >= CLUSTERS.length) return;
    const { color, cx, cy, baseRx, baseRy } = CLUSTERS[i];
    const scale = clampN(0.55 + seg.pct / 25, 0.7, 1.7);
    const rx = baseRx * scale;
    const ry = baseRy * scale;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dx = (c - cx) / rx;
        const dy = (r - cy) / ry;
        if (dx * dx + dy * dy <= 1) dots[r * COLS + c] = color;
      }
    }
  });

  const raw = [...dots];

  /* Feathered boundary — same algorithm as before */
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
  return { feathered, raw };
}

/* accent color → segment id, used for dot hit-testing */
const COLOR_TO_SEG: Record<string, string> = {
  "#7C3AED": "gym",
  "#3B82F6": "busy",
  "#10B981": "health",
  "#F59E0B": "weight",
  "#EC4899": "nutrition",
};

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
  proposedMap?: AudienceMapResult;
}

/* ─── Dot map component ───────────────────────────────────────────── */
function AudienceMap({
  segments,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  segments: Segment[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  /* Recompute dot grid whenever segment percentages change */
  const { feathered: activeDots, raw: activeRaw } = useMemo(
    () => buildDynamicDots(segments),
    [segments],
  );

  /* Debounce hover so rapid dot-to-dot moves don't cause jitter */
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleHover = (id: string | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => onHover(id), 45);
  };

  const activeId = hoveredId ?? selectedId;
  const active = activeId ? segments.find((s) => s.id === activeId) ?? null : null;

  /* Keep last non-null segment so tooltip content stays stable during fade-out */
  const lastActive = useRef<Segment | null>(active);
  if (active) lastActive.current = active;
  const display = lastActive.current;

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid #F0EDF9",
        borderRadius: 12,
        padding: "10px 14px 8px",
      }}
    >
      {/* Dot grid — width: 100% + overflow: hidden prevents any spill */}
      <div
        style={{ width: "100%", overflow: "hidden" }}
        onMouseLeave={() => scheduleHover(null)}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 3,
          }}
        >
          {activeDots.map((color, i) => {
            const segId = COLOR_TO_SEG[activeRaw[i]] ?? null;
            const isClickable = segId !== null;
            const isUntapped = activeRaw[i] === GREY;
            return (
              <div
                key={i}
                onClick={() => {
                  if (!isClickable) { onSelect(null); return; }
                  onSelect(segId === selectedId ? null : segId);
                }}
                onMouseEnter={() => isClickable && scheduleHover(segId)}
                style={{
                  aspectRatio: "1",
                  minWidth: 0,
                  cursor: isClickable ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "72%",
                    height: "72%",
                    borderRadius: "9999px",
                    background: isUntapped ? "#EEF0F4" : color,
                    opacity: isUntapped ? 0.72 : 0.82,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip — always mounted, fades and slides smoothly */}
      <div style={{ position: "relative", height: 52 }}>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: display?.tooltipLeft ?? "14%",
            /* Flip anchor direction for right-edge clusters so tooltip grows leftward */
            transform: parseFloat(display?.tooltipLeft ?? "14") > 65
              ? "translateX(-82%)"
              : "translateX(-10%)",
            background: "#fff",
            border: `1px solid ${display?.accent ?? "#7C3AED"}44`,
            borderRadius: 10,
            padding: "8px 12px",
            boxShadow: `0 4px 16px ${display?.accent ?? "#7C3AED"}22`,
            minWidth: 160,
            maxWidth: "calc(100% - 24px)",
            pointerEvents: "none",
            zIndex: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            opacity: active ? 1 : 0,
            transition: "left 0.22s ease, opacity 0.18s ease",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{display?.name}</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
            {display?.pct}% of audience
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: display?.accent, marginTop: 2 }}>
            {display?.range} people
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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
function Bubble({
  msg,
  onConfirm,
  onDismiss,
  isPending = false,
}: {
  msg: Message;
  onConfirm: () => void;
  onDismiss: () => void;
  isPending?: boolean;
}) {
  if (msg.role === "confirm") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", minWidth: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: `#EDE9FE url(${logoImg}) center/cover no-repeat`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
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
              wordBreak: "break-word",
              minWidth: 0,
            }}
          >
            {msg.text}
          </div>
          {/* Confirm + Dismiss buttons only on the live pending bubble */}
          {isPending && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={onConfirm}
                style={{
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
              <button
                onClick={onDismiss}
                style={{
                  background: "transparent",
                  color: "#6B7280",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.role === "success") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", minWidth: 0 }}>
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
            minWidth: 0,
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "ai") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", minWidth: 0 }}>
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
            minWidth: 0,
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
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
          wordBreak: "break-word",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

/* ─── Thinking bubble ─────────────────────────────────────────────── */
function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", minWidth: 0 }}>
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
          padding: "10px 14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1 }}>
          Audense is thinking
        </span>
        <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#A78BFA",
                display: "inline-block",
                animation: `audense-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ─── Split layout constants ──────────────────────────────────────── */
const SPLIT_KEY = "audense-dashboard-split";
const SPLIT_MIN = 30;
const SPLIT_MAX = 70;
const SPLIT_DEFAULT = 50;

function clampSplit(v: number) {
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, v));
}

function loadSplit(): number {
  try {
    const raw = localStorage.getItem(SPLIT_KEY);
    if (raw !== null) return clampSplit(Number(raw));
  } catch {}
  return SPLIT_DEFAULT;
}

/* ─── Main Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const [, navigate] = useLocation();
  const ob = loadOnboarding();

  const displayName = ob?.displayName ?? "Founder";

  /* Load or generate the audience map — mutable so confirmed updates re-render */
  const [audienceMap, setAudienceMap] = useState<AudienceMapResult>(
    () => loadAudienceMap() ?? generateMockAudienceMap(ob)
  );

  const shortRegion = audienceMap.region.length > 20
    ? audienceMap.region.split(",")[0].trim()
    : audienceMap.region;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [splitPct, setSplitPct] = useState<number>(loadSplit);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = clampSplit(((ev.clientX - rect.left) / rect.width) * 100);
      setSplitPct(pct);
    };

    const onMouseUp = (ev: MouseEvent) => {
      isDragging.current = false;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pct = clampSplit(((ev.clientX - rect.left) / rect.width) * 100);
        try { localStorage.setItem(SPLIT_KEY, String(pct)); } catch {}
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const [segments, setSegments] = useState<Segment[]>(() => buildSegmentsFromMap(audienceMap));
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>("gym");
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  /* ── Dynamic chips ──────────────────────────────────────────────── */
  /* Chips from the last AI response (suggestedActions) */
  const [suggestedChips, setSuggestedChips] = useState<string[]>([]);
  /* True once the user has explicitly clicked a segment card/dot */
  const [hasSelectedSegment, setHasSelectedSegment] = useState(false);

  const [researchRunning, setResearchRunning] = useState(false);
  const [researchToast, setResearchToast] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (kind: "success" | "error" | "info", text: string) => {
    setResearchToast({ kind, text });
    setTimeout(() => setResearchToast(null), 5000);
  };

  const runLiveResearch = async () => {
    if (researchRunning) return;
    setResearchRunning(true);
    showToast("info", "Scanning public signals…");
    try {
      const res = await fetch("/api/research/collect-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingData: ob ?? {}, currentAudienceMap: audienceMap }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json() as {
        sourceMode: "live_research" | "ai_hypothesis";
        signals: ResearchSignal[];
        urlBackedSignalCount: number;
        evidenceSummary: AudienceMapResult["evidenceSummary"];
        updatedSegments: AudienceMapResult["segments"];
      };

      /* Only apply map update if we have useful data — never wipe a good map */
      const hasUsefulSignals = data.signals.length > 0;
      if (hasUsefulSignals) {
        const updatedMap: AudienceMapResult = {
          ...audienceMap,
          evidenceSummary: data.evidenceSummary,
          segments: data.updatedSegments,
        };
        setAudienceMap(updatedMap);
        setSegments(buildSegmentsFromMap(updatedMap));
        saveAudienceMap(updatedMap);
      } else {
        /* Still update just the evidenceSummary so sourceMode/limitations stay honest */
        if (data.evidenceSummary) {
          const updatedMap: AudienceMapResult = { ...audienceMap, evidenceSummary: data.evidenceSummary };
          setAudienceMap(updatedMap);
          saveAudienceMap(updatedMap);
        }
      }

      const urlCount    = data.urlBackedSignalCount ?? data.signals.filter((s) => s.url).length;
      const sourcesUsed = data.evidenceSummary?.sourcesUsed ?? [];
      const usedHN      = sourcesUsed.includes("hacker_news");
      if (data.sourceMode === "live_research") {
        const sourceLabel = usedHN ? "Hacker News / public tech discussion" : "public discussion";
        showToast("success", `Live ${sourceLabel} signals found — ${urlCount} source-backed signal${urlCount !== 1 ? "s" : ""} added.`);
      } else if (urlCount >= 1) {
        showToast("info", "Not enough live signals found yet — this map is still hypothesis-led.");
      } else {
        showToast("info", "No live source-backed signals found yet. Audense is still using hypothesis-led audience estimates.");
      }
    } catch {
      showToast("error", "Research scan failed — your map is unchanged");
    } finally {
      setResearchRunning(false);
    }
  };

  /* pendingUpdateId: the msg.id of the one active confirm bubble, or null */
  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  /* Synchronous ref guard — prevents stale-closure double-fires before re-render */
  const pendingUpdateRef = useRef<number | null>(null);
  /* The proposed AudienceMapResult waiting for confirm/dismiss */
  const pendingMapRef = useRef<AudienceMapResult | null>(null);
  const msgId = useRef(100);

  const [messages, setMessages] = useState<Message[]>(() => loadChatMessages(displayName));
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveChatMessages(messages);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isSending) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending]);

  const callRefineAPI = async (text: string) => {
    const userMsg: Message = { id: ++msgId.current, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const recentMessages = messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/chat/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingData: ob ?? {},
          currentAudienceMap: audienceMap,
          messages: recentMessages,
          userMessage: text,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json() as {
        type: "answer" | "proposed_update";
        message: string;
        proposedAudienceMap: AudienceMapResult | null;
        suggestedActions: string[];
      };

      if (data.type === "proposed_update" && data.proposedAudienceMap) {
        /* Guard: if another update is pending, tell user to resolve it first */
        if (pendingUpdateRef.current !== null) {
          const guardMsg: Message = {
            id: ++msgId.current,
            role: "ai",
            text: "Please confirm or dismiss the current proposed update before requesting another change.",
          };
          setMessages((prev) => [...prev, guardMsg]);
          return;
        }

        const confirmId = ++msgId.current;
        pendingMapRef.current = data.proposedAudienceMap;
        pendingUpdateRef.current = confirmId;
        setPendingUpdateId(confirmId);

        const confirmMsg: Message = {
          id: confirmId,
          role: "confirm",
          text: data.message,
          proposedMap: data.proposedAudienceMap,
        };
        setMessages((prev) => [...prev, confirmMsg]);
        /* Chips switch to pending mode — clear any previous suggestedActions */
        setSuggestedChips([]);
      } else {
        const aiMsg: Message = {
          id: ++msgId.current,
          role: "ai",
          text: data.message,
        };
        setMessages((prev) => [...prev, aiMsg]);
        /* Replace chips with suggestedActions from this response if provided */
        const actions = data.suggestedActions ?? [];
        const unique = [...new Set(actions.map((a: string) => a.trim()).filter(Boolean))].slice(0, 3);
        setSuggestedChips(unique);
      }
    } catch {
      /* Network/parse error — show generic fallback */
      const errMsg: Message = {
        id: ++msgId.current,
        role: "ai",
        text: "I'm having trouble reaching the server. Your audience map is safe — try again in a moment.",
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    setChatInput("");
    setIsSending(true);
    try {
      await callRefineAPI(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirm = () => {
    /* Synchronous ref check — fires before any re-render, prevents double-apply */
    if (pendingUpdateRef.current === null) return;
    const map = pendingMapRef.current;
    pendingUpdateRef.current = null;
    pendingMapRef.current = null;
    setPendingUpdateId(null);
    setSuggestedChips([]);

    if (map) {
      setAudienceMap(map);
      setSegments(buildSegmentsFromMap(map));
      saveAudienceMap(map);
    }

    const successMsg: Message = {
      id: ++msgId.current,
      role: "success",
      text: "Done — I've updated your audience map based on that.",
    };
    setMessages((prev) => [...prev, successMsg]);
  };

  const handleDismiss = () => {
    if (pendingUpdateRef.current === null) return;
    pendingUpdateRef.current = null;
    pendingMapRef.current = null;
    setPendingUpdateId(null);
    setSuggestedChips([]);

    const dismissMsg: Message = {
      id: ++msgId.current,
      role: "ai",
      text: "No problem — I'll leave the audience map unchanged.",
    };
    setMessages((prev) => [...prev, dismissMsg]);
  };

  /* ── Active chips derivation ────────────────────────────────────── */
  const activeChips = useMemo(() => {
    /* Priority 1: pending update overrides everything */
    if (pendingUpdateId !== null) {
      return ["Confirm update", "Dismiss update", "What changed?"];
    }
    /* Priority 2: suggestedActions returned by the last AI response */
    if (suggestedChips.length > 0) {
      return suggestedChips;
    }
    /* Priority 3: user has explicitly clicked a segment */
    if (hasSelectedSegment && selectedSegmentId) {
      const seg = segments.find((s) => s.id === selectedSegmentId);
      if (seg) {
        return [
          `Why ${seg.name}?`,
          `Where do I find ${seg.name}?`,
          `What objections will ${seg.name} have?`,
        ];
      }
    }
    /* Priority 4: default — reference top segment by name */
    const topSeg = segments[0];
    if (topSeg) {
      return [
        "Who should I target first?",
        `Where do I find ${topSeg.name}?`,
        `What message works for ${topSeg.name}?`,
      ];
    }
    return ["Who should I target first?", "Where do I find them?", "What message works?"];
  }, [pendingUpdateId, suggestedChips, hasSelectedSegment, selectedSegmentId, segments]);

  const sendChip = async (chip: string) => {
    if (isSending) return;
    /* Pending update special chips */
    if (chip === "Confirm update") { handleConfirm(); return; }
    if (chip === "Dismiss update") { handleDismiss(); return; }
    /* "What changed?" is only meaningful while a pending update still exists */
    if (chip === "What changed?" && pendingUpdateRef.current === null) return;
    /* Regular chips cannot be sent while a pending update is unresolved
       (except the three above which are handled above) */
    if (pendingUpdateRef.current !== null && chip !== "What changed?") return;
    setSuggestedChips([]);
    setIsSending(true);
    try {
      await callRefineAPI(chip);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
    <div
      ref={containerRef}
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
          width: `${splitPct}%`,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
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
            overflowX: "hidden",
            padding: "6px 20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minWidth: 0,
          }}
        >
          {messages.map((msg) => (
            <Bubble
              key={msg.id}
              msg={msg}
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
              isPending={msg.id === pendingUpdateId}
            />
          ))}
          {isSending && <ThinkingBubble />}
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
          {activeChips.map((chip) => {
            const isPending = pendingUpdateId !== null;
            const isConfirm = chip === "Confirm update";
            const isDismiss = chip === "Dismiss update";
            const disabled  = isSending;
            const accentBg  = isConfirm ? "#F0FDF4" : isDismiss ? "#FEF2F2" : isPending ? "#FFFBEB" : "#F5F3FF";
            const accentBorder = isConfirm ? "#BBF7D0" : isDismiss ? "#FECACA" : isPending ? "#FDE68A" : "#DDD6FE";
            const accentColor  = isConfirm ? "#15803D" : isDismiss ? "#B91C1C" : isPending ? "#92400E" : "#6D28D9";
            return (
              <button
                key={chip}
                onClick={() => sendChip(chip)}
                disabled={disabled}
                title={chip}
                style={{
                  background: disabled ? "#F9FAFB" : accentBg,
                  border: `1px solid ${disabled ? "#E5E7EB" : accentBorder}`,
                  borderRadius: 20,
                  padding: "5px 11px",
                  fontSize: 11.5,
                  fontWeight: isConfirm || isDismiss ? 600 : 500,
                  color: disabled ? "#9CA3AF" : accentColor,
                  cursor: disabled ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: disabled ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Chat input */}
        <div
          style={{
            padding: "10px 20px 8px",
            flexShrink: 0,
            borderTop: "1px solid #F3F4F6",
            minWidth: 0,
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
              minWidth: 0,
              overflow: "hidden",
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
              placeholder={isSending ? "Thinking…" : "Ask your audience anything..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
              disabled={isSending || pendingUpdateId !== null}
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
              disabled={!chatInput.trim() || isSending || pendingUpdateId !== null}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: !chatInput.trim() || isSending || pendingUpdateId !== null ? "#C4B5FD" : "#7C3AED",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !chatInput.trim() || isSending || pendingUpdateId !== null ? "not-allowed" : "pointer",
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
          <NavItem icon={<Settings size={15} />} label="Settings" onClick={() => setIsSettingsOpen(true)} />

          {/* Help popover anchor */}
          <div style={{ position: "relative" }}>
            {isHelpPopoverOpen && (
              <>
                {/* backdrop to close on outside click */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 9000 }}
                  onClick={() => setIsHelpPopoverOpen(false)}
                />
                <div
                  style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0,
                    width: 200, background: "#fff",
                    borderRadius: 10, boxShadow: "0 8px 32px rgba(15,23,42,0.16)",
                    border: "1px solid #E5E7EB",
                    zIndex: 9001, overflow: "hidden",
                    padding: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setIsHelpPopoverOpen(false); setIsHelpModalOpen(true); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      width: "100%", padding: "9px 12px", borderRadius: 7,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13.5, color: "#374151", fontWeight: 500,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3FF")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    How it works
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsHelpPopoverOpen(false); setIsSupportModalOpen(true); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      width: "100%", padding: "9px 12px", borderRadius: 7,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13.5, color: "#374151", fontWeight: 500,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3FF")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    Get support
                  </button>
                </div>
              </>
            )}
            <NavItem
              icon={<HelpCircle size={15} />}
              label="Need help?"
              onClick={() => setIsHelpPopoverOpen((v) => !v)}
            />
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div
        onMouseDown={onDividerMouseDown}
        style={{
          width: 5,
          flexShrink: 0,
          cursor: "col-resize",
          background: "#E5E7EB",
          zIndex: 10,
        }}
      />

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
              padding: "16px 20px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.4 }}>
                Your Audience
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={runLiveResearch}
                disabled={researchRunning}
                title={researchRunning ? "Scanning…" : "Run live research signals"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: researchRunning ? "#F5F3FF" : "#fff",
                  border: "1.5px solid #DDD6FE",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: researchRunning ? "#9CA3AF" : "#6D28D9",
                  cursor: researchRunning ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {researchRunning ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        border: "1.5px solid #DDD6FE",
                        borderTopColor: "#7C3AED",
                        borderRadius: "50%",
                        animation: "audense-spin 0.7s linear infinite",
                      }}
                    />
                    Scanning…
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 13 }}>⚡</span>
                    Run live research
                  </>
                )}
              </button>
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

          {/* Research toast */}
          {researchToast && (
            <div
              style={{
                margin: "0 20px 10px",
                padding: "9px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: researchToast.kind === "success" ? "#ECFDF5"
                  : researchToast.kind === "error" ? "#FEF2F2"
                  : "#EFF6FF",
                color: researchToast.kind === "success" ? "#065F46"
                  : researchToast.kind === "error" ? "#991B1B"
                  : "#1D4ED8",
                border: `1px solid ${researchToast.kind === "success" ? "#A7F3D0"
                  : researchToast.kind === "error" ? "#FECACA"
                  : "#BFDBFE"}`,
              }}
            >
              <span>
                {researchToast.kind === "success" ? "✓" : researchToast.kind === "error" ? "✗" : "↻"}
              </span>
              {researchToast.text}
            </div>
          )}
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
            padding: "20px 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              {
                label: "Reachable Audience",
                value: `${formatK(audienceMap.reachableAudience.min)} – ${formatK(audienceMap.reachableAudience.max)}`,
                sub: `people in ${shortRegion}`,
                icon: "👥",
                accent: false,
                border: "#E5E7EB",
                valColor: "#111827",
              },
              {
                label: "Est. Coverage",
                value: `${audienceMap.coverage.percent}%`,
                sub: `~${formatK(audienceMap.coverage.people)} people`,
                icon: "🎯",
                accent: true,
                border: "#C4B5FD",
                valColor: "#7C3AED",
              },
              {
                label: "Untapped Opportunity",
                value: `${audienceMap.untapped.percent}%`,
                sub: `~${formatK(audienceMap.untapped.min)} – ${formatK(audienceMap.untapped.max)} people`,
                icon: "💡",
                accent: false,
                border: "#FDE68A",
                valColor: "#111827",
              },
              {
                label: "Confidence",
                value: audienceMap.confidence,
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
              padding: "14px 16px 12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                  Audience Universe
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 600, color: "#6B7280", flexWrap: "wrap" }}>
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
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 8 }}>
              Each dot represents ~2,000 people in your reachable audience
            </div>
            <AudienceMap
              segments={segments}
              selectedId={selectedSegmentId}
              hoveredId={hoveredSegmentId}
              onSelect={(id) => {
                setSelectedSegmentId(id);
                setHasSelectedSegment(true);
                setSuggestedChips([]);
              }}
              onHover={setHoveredSegmentId}
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
            </div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 14 }}>
              Click a segment to explore deeper insights
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {segments.map((seg) => {
                const isActive = selectedSegmentId === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => {
                      setSelectedSegmentId(isActive ? null : seg.id);
                      setHasSelectedSegment(true);
                      setSuggestedChips([]);
                    }}
                    onMouseEnter={() => setHoveredSegmentId(seg.id)}
                    onMouseLeave={() => setHoveredSegmentId(null)}
                    style={{
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
                          wordBreak: "break-word",
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
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {seg.platforms.map((p) => (
                          <PlatformIcon key={p} name={p} />
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

    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
    </>
  );
}
