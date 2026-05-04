import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Settings, HelpCircle, Send, Plus, Paperclip, X as XIcon, FileText, Image,
  Home, Layers, User, MessageSquare, BarChart3,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  type AudienceMapResult, type ResearchSignal, type CompetitorIntelligence, type CompetitorItem,
} from "../lib/audienceMap";
import {
  loadSessions, getActiveSession, getActiveSessionId, setActiveSessionId,
  updateActiveSession, upsertSession,
  type ResearchSession, type StoredMessage,
} from "../lib/researchSessions";
import { AuthModal } from "../components/AuthModal";
import { SoftPromptModal, NewResearchAuthWall, LeavingDashboardConfirm } from "../components/GuestModals";
import { onAuthChange, signOut, getCurrentUser, type AuthUser } from "../lib/auth";
import { sbAppendMessage, sbUpdateMap, sbLoadSessionList, sbLoadFullSession, sbSaveSession } from "../lib/sbSessions";
import {
  hasGuestResearch, isGuestMigrated, setGuestMigrated, clearGuestResearch,
  incGuestChatCount, getSoftPromptSeenAt, setSoftPromptSeenAt,
} from "../lib/guestMode";
import { saveSessions } from "../lib/researchSessions";

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
    text: `Hi ${displayName} 👋 I'm AudienceIQ, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them. Let's start with your product.`,
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

/* ─── Rail icon button ────────────────────────────────────────────── */
function RailIcon({
  icon, label, onClick, active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "none",
        background: active || hovered ? "#F5F3FF" : "transparent",
        color: active ? "#7C3AED" : onClick ? (hovered ? "#7C3AED" : "#6B7280") : "#D1D5DB",
        cursor: onClick ? "pointer" : "default",
        marginBottom: 2,
        flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {icon}
    </button>
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
            background: `transparent url(${logoImg}) center/contain no-repeat`,
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
            background: `transparent url(${logoImg}) center/contain no-repeat`,
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
            background: `transparent url(${logoImg}) center/contain no-repeat`,
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
          AudienceIQ is thinking
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
                animation: `audienceiq-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ─── Competitor Drawer ───────────────────────────────────────────── */
const CONF_COLOR: Record<string, string> = { high: "#059669", medium: "#D97706", low: "#6B7280" };
const CONF_BG: Record<string, string>    = { high: "#ECFDF5", medium: "#FFFBEB", low: "#F3F4F6" };

function CompetitorSection({
  title, items,
}: { title: string; items: CompetitorItem[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B7280", marginBottom: 10 }}>
        {title}
      </div>
      {items.map((item) => (
        <div
          key={item.name}
          style={{
            background: "#F9F8FF", border: "1px solid #EDE9FE",
            borderRadius: 10, padding: "12px 14px", marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{item.name}</span>
            <span
              style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10,
                background: CONF_BG[item.confidence] ?? "#F3F4F6",
                color: CONF_COLOR[item.confidence] ?? "#6B7280",
              }}
            >
              {item.confidence}
            </span>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 10, color: "#7C3AED", textDecoration: "none", marginLeft: "auto" }}
              >
                {item.sourceLabel ?? "Source ↗"}
              </a>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 4, lineHeight: 1.5 }}>
            {item.whyRelevant}
          </div>
          <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 500, lineHeight: 1.45 }}>
            Gap to exploit: {item.weaknessToExploit}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompetitorDrawer({
  competitors, productSummary, onClose,
}: {
  competitors: CompetitorIntelligence;
  productSummary: string;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 200 }}
      />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 420, maxWidth: "92vw",
          background: "#fff",
          boxShadow: "-4px 0 28px rgba(0,0,0,0.12)",
          zIndex: 201,
          display: "flex", flexDirection: "column",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6",
            display: "flex", alignItems: "flex-start", gap: 10, flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", marginBottom: 3 }}>
              Competitors & Alternatives
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>
              {productSummary}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "#F3F4F6", borderRadius: 8,
              width: 28, height: 28, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#6B7280", flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {competitors.notes && (
          <div
            style={{
              margin: "12px 20px 0", padding: "8px 12px",
              background: "#FFFBEB", border: "1px solid #FDE68A",
              borderRadius: 8, fontSize: 11, color: "#92400E", lineHeight: 1.5,
              flexShrink: 0,
            }}
          >
            {competitors.notes}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          <CompetitorSection title="Direct competitors" items={competitors.direct} />
          <CompetitorSection title="Adjacent (competing for attention)" items={competitors.adjacent} />
          <CompetitorSection title="What users do today instead" items={competitors.substitutes} />
        </div>
      </div>
    </>
  );
}

/* ─── Research History Panel ─────────────────────────────────────── */
function HistoryPanel({
  onClose,
  onSelect,
  activeSessionId,
  sessions: sessionsProp,
  loading,
  isGuest,
  onSignUp,
}: {
  onClose: () => void;
  onSelect: (session: ResearchSession) => void;
  activeSessionId: string;
  sessions?: ResearchSession[];
  loading?: boolean;
  isGuest?: boolean;
  onSignUp?: () => void;
}) {
  /* Guests never see a multi-session list — full research history is a
     signed-in feature. We deliberately do NOT read localStorage for guests
     here because old/stale local sessions (from before single-session
     enforcement) could otherwise leak into the drawer. */
  const sessions = isGuest ? [] : (sessionsProp ?? loadSessions());

  function fmtDate(iso: string) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      if (diffMin < 2)  return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24)   return `${diffH}h ago`;
      const diffD = Math.floor(diffH / 24);
      if (diffD < 7)    return `${diffD}d ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch { return ""; }
  }

  const CATEGORY_LABELS: Record<string, string> = {
    "health-fitness": "Health & Fitness",
    saas:             "SaaS",
    ecommerce:        "E-commerce",
    education:        "Education",
    finance:          "Finance",
    "creator-tools":  "Creator Tools",
    "consumer-apps":  "Consumer Apps",
  };

  const REGION_LABELS: Record<string, string> = {
    us: "United States", uk: "United Kingdom", ca: "Canada",
    au: "Australia", in: "India", de: "Germany", fr: "France",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.25)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 380, zIndex: 5001,
          background: "#fff",
          display: "flex", flexDirection: "column",
          boxShadow: "4px 0 32px rgba(15,23,42,0.16)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6", flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Research history</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
              {isGuest
                ? "Sign up to save and revisit"
                : loading
                  ? "Loading…"
                  : sessions.length === 0
                    ? "No sessions yet"
                    : `${sessions.length} session${sessions.length !== 1 ? "s" : ""}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "#F3F4F6", borderRadius: 8,
              width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#6B7280",
            }}
          >
            ×
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}>
          {isGuest ? (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", paddingTop: 60, gap: 12, textAlign: "center",
                paddingLeft: 16, paddingRight: 16,
              }}
            >
              <div style={{ fontSize: 36 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Sign up to save and revisit research history.
              </div>
              <div style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 260, lineHeight: 1.5 }}>
                Free accounts keep every research session, so you can come back to past audience maps any time.
              </div>
              {onSignUp && (
                <button
                  onClick={onSignUp}
                  style={{
                    marginTop: 6,
                    background: "#7C3AED",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign up — it's free
                </button>
              )}
            </div>
          ) : loading ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              paddingTop: 60, color: "#9CA3AF", fontSize: 14,
            }}>Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", paddingTop: 60, gap: 8, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>No previous research yet.</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 240, lineHeight: 1.5 }}>
                Create a new research map to see it here.
              </div>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const cat = s.onboardingData?.finalCategory ?? s.onboardingData?.category ?? "";
              const reg = s.onboardingData?.finalRegion   ?? s.onboardingData?.region   ?? "";
              const catLabel = CATEGORY_LABELS[cat] ?? cat;
              const regLabel = REGION_LABELS[reg]   ?? reg;
              const reach = s.audienceMap?.reachableAudience;
              const reachStr = reach
                ? `${formatK(reach.min)} – ${formatK(reach.max)}`
                : null;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: isActive ? "#F5F3FF" : "#FAFAFA",
                    border: isActive ? "1.5px solid #C4B5FD" : "1.5px solid #E5E7EB",
                    borderRadius: 12, padding: "14px 16px", marginBottom: 8,
                    cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#F9F8FF";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#C4B5FD";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#FAFAFA";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 13.5, fontWeight: 600,
                            color: isActive ? "#6D28D9" : "#111827",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: 200,
                          }}
                        >
                          {s.title}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: 10.5, fontWeight: 600, color: "#7C3AED",
                              background: "#EDE9FE", borderRadius: 20, padding: "2px 8px",
                              flexShrink: 0,
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 6 }}>
                        {catLabel && (
                          <span style={{ fontSize: 11.5, color: "#6B7280" }}>
                            {catLabel}
                          </span>
                        )}
                        {regLabel && (
                          <span style={{ fontSize: 11.5, color: "#6B7280" }}>
                            {regLabel}
                          </span>
                        )}
                        {reachStr && (
                          <span style={{ fontSize: 11.5, color: "#7C3AED", fontWeight: 500 }}>
                            {reachStr} people
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0, paddingTop: 2 }}>
                      {fmtDate(s.updatedAt)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
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

  /* ── Active session — drives initial hydration ──────────────────── */
  const [activeSessionId, setActiveSessionIdState] = useState<string>(
    () => getActiveSessionId() ?? "",
  );

  const [ob, setOb] = useState<Record<string, string> | null>(() => {
    const session = getActiveSession();
    if (session) return session.onboardingData;
    return loadOnboarding();
  });

  const displayName = ob?.displayName ?? "Founder";

  /* Load the audience map — *only* from the active session.
     The previous fallback (`loadAudienceMap()`) read the global
     `audense-audience-map` compat key, which could contain stale data from a
     previous research and bleed into a new/empty session. If there's no
     active session, we render a fresh in-memory mock; the fresh-session
     guard below redirects unauthenticated visitors to landing anyway. */
  const [audienceMap, setAudienceMap] = useState<AudienceMapResult>(() => {
    const session = getActiveSession();
    if (session) return session.audienceMap;
    return generateMockAudienceMap(ob);
  });

  const shortRegion = audienceMap.region.length > 20
    ? audienceMap.region.split(",")[0].trim()
    : audienceMap.region;

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const authUserRef = useRef<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [sbSessionItems, setSbSessionItems] = useState<ResearchSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Guest-mode modal state ─────────────────────────────────────── */
  const [isSoftPromptOpen, setIsSoftPromptOpen] = useState(false);
  const [isNewResearchAuthWall, setIsNewResearchAuthWall] = useState(false);
  const postAuthActionRef = useRef<"new-research" | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showCompetitorDrawer, setShowCompetitorDrawer] = useState(false);
  const [splitPct, setSplitPct] = useState<number>(loadSplit);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"map" | "chat">("map");

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

  /* ── Per-session UI reset ─────────────────────────────────────────
     Whenever the active session changes (new research, history switch,
     auth-driven reset), wipe any per-session UI selection so highlights
     and dynamic chips can never leak across products. switchSession()
     also resets these explicitly; this effect guarantees the reset for
     any other code path that mutates activeSessionId. */
  useEffect(() => {
    setSelectedSegmentId("gym");
    setHoveredSegmentId(null);
    setHasSelectedSegment(false);
    setSuggestedChips([]);
  }, [activeSessionId]);
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
        competitors?: AudienceMapResult["competitors"];
      };

      /* Only apply map update if we have useful data — never wipe a good map */
      const hasUsefulSignals = data.signals.length > 0;
      if (hasUsefulSignals) {
        const existingCompetitors = audienceMap.competitors;
        let mergedCompetitors = existingCompetitors;
        if (data.competitors && existingCompetitors) {
          const existingDirectNames = new Set(existingCompetitors.direct.map((c) => c.name.toLowerCase()));
          const newDirect = data.competitors.direct.filter((c) => !existingDirectNames.has(c.name.toLowerCase()));
          mergedCompetitors = {
            direct: [...existingCompetitors.direct, ...newDirect],
            adjacent: existingCompetitors.adjacent,
            substitutes: existingCompetitors.substitutes,
            notes: existingCompetitors.notes,
          };
        } else if (data.competitors && !existingCompetitors) {
          mergedCompetitors = data.competitors;
        }

        const updatedMap: AudienceMapResult = {
          ...audienceMap,
          evidenceSummary: data.evidenceSummary,
          segments: data.updatedSegments,
          ...(mergedCompetitors ? { competitors: mergedCompetitors } : {}),
        };
        setAudienceMap(updatedMap);
        setSegments(buildSegmentsFromMap(updatedMap));
        saveAudienceMap(updatedMap);
        updateActiveSession({ audienceMap: updatedMap });
        const sid1 = getActiveSessionId();
        if (authUserRef.current && sid1) sbUpdateMap(sid1, updatedMap).catch(() => {});
      } else {
        /* Still update just the evidenceSummary so sourceMode/limitations stay honest */
        if (data.evidenceSummary) {
          const updatedMap: AudienceMapResult = {
            ...audienceMap,
            evidenceSummary: data.evidenceSummary,
            ...(audienceMap.competitors ? { competitors: audienceMap.competitors } : {}),
          };
          setAudienceMap(updatedMap);
          saveAudienceMap(updatedMap);
          updateActiveSession({ audienceMap: updatedMap });
          const sid2 = getActiveSessionId();
          if (authUserRef.current && sid2) sbUpdateMap(sid2, updatedMap).catch(() => {});
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
        showToast("info", "No live source-backed signals found yet. AudienceIQ is still using hypothesis-led audience estimates.");
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
  const prevMsgCountRef = useRef(0);

  const [messages, setMessages] = useState<Message[]>(() => {
    const session = getActiveSession();
    if (session?.chatMessages && session.chatMessages.length > 0) {
      return session.chatMessages as Message[];
    }
    return loadChatMessages(displayName);
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── User-isolation helpers ─────────────────────────────────────── */
  /* Clears data keys that belong to the *active research session* and the
     current user's identity. Display name is per-user and must never bleed.
     Guest tracking flags (audense-has-created-guest-research, guest counters,
     soft-prompt seen list, split-pct) are intentionally kept. */
  const clearLocalSessionData = useCallback(() => {
    try {
      localStorage.removeItem("audense-active-session-id");
      localStorage.removeItem("audense-research-sessions");
      localStorage.removeItem("audense-audience-map");
      localStorage.removeItem("audense-chat-messages");
      localStorage.removeItem("audense_onboarding");
      localStorage.removeItem("audense-display-name");
    } catch {}
  }, []);

  /* Resets Dashboard React state back to a fresh greeting + mock map. */
  const resetDashboardState = useCallback(() => {
    setActiveSessionIdState("");
    setOb(null);
    const fresh = generateMockAudienceMap(null);
    setAudienceMap(fresh);
    setSegments(buildSegmentsFromMap(fresh));
    const greeting = buildGreeting("Founder");
    setMessages([greeting]);
    prevMsgCountRef.current = 1;
    pendingUpdateRef.current = null;
    pendingMapRef.current = null;
    setPendingUpdateId(null);
    setSuggestedChips([]);
  }, []);

  /* ── Guest → account migration (idempotent via isGuestMigrated) ─── */
  const migrateGuestSession = useCallback(async () => {
    if (!hasGuestResearch()) return;
    const sid = getActiveSessionId();
    if (!sid || isGuestMigrated(sid)) return;
    const session = getActiveSession();
    if (!session) return;
    try {
      const ok = await sbSaveSession(session);
      if (!ok) return;
      setGuestMigrated(sid);
      /* Prune local list to *only* this migrated session and drop the
         guest flag so stale guest entries can't bleed into account or
         future-guest history. Mirrors the auth-subscription branch.
         Gated on actual Supabase success so a failed save can be retried
         on the next auth-trigger instead of being silently marked done. */
      saveSessions([session]);
      clearGuestResearch();
    } catch { /* non-blocking — local data is still intact */ }
  }, []);

  /* ── Fresh-session guard ────────────────────────────────────────────
     If a visitor deep-links to /dashboard with no local research session,
     no onboarding data, and no signed-in account, send them to the
     landing page so they always start there on a fresh session. */
  useEffect(() => {
    let cancelled = false;
    const hasLocalSession = !!getActiveSession();
    const hasOnboarding = !!loadOnboarding();
    if (hasLocalSession || hasOnboarding) return;
    (async () => {
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) navigate("/");
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  /* ── Auth subscription: handles sign-in, sign-out, and user switch ── */
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    return onAuthChange(async (user) => {
      const prev = prevUserIdRef.current;
      const next = user?.id ?? null;
      authUserRef.current = user;
      setAuthUser(user);

      /* First fire from Supabase is the INITIAL_SESSION restore — seed only,
         do not treat as a transition (otherwise we'd wipe a returning user's cache). */
      if (prev === undefined) {
        prevUserIdRef.current = next;
        return;
      }
      if (prev === next) return;

      if (next === null) {
        /* Sign-out: clear active research data so the next user can't see it. */
        clearLocalSessionData();
        resetDashboardState();
        setSbSessionItems([]);
      } else if (prev === null) {
        /* Guest → signed in. Migrate the *active* guest research if any,
           and prune local storage to just that session so any stale guest
           entries from before single-session enforcement cannot bleed into
           future guest or signed-in sessions. */
        const sid = getActiveSessionId();
        const guestSess = sid && hasGuestResearch() ? getActiveSession() : null;
        if (sid && guestSess && !isGuestMigrated(sid)) {
          try {
            const ok = await sbSaveSession(guestSess);
            if (ok) {
              setGuestMigrated(sid);
              /* Replace any multi-entry local list with just the migrated
                 session, and drop the guest flag — this is now an account
                 session, not a guest one. Gated on actual Supabase success
                 so a transient failure can retry on the next auth event. */
              saveSessions([guestSess]);
              clearGuestResearch();
            }
          } catch {}
        } else if (!guestSess) {
          clearLocalSessionData();
          resetDashboardState();
        }
      } else {
        /* User A → User B switch: never inherit User A's cache. */
        clearLocalSessionData();
        resetDashboardState();
        setSbSessionItems([]);
      }

      prevUserIdRef.current = next;
    });
  }, [clearLocalSessionData, resetDashboardState]);

  /* ── Central auth handler (used by all modals) ──────────────────── */
  const handleAuth = useCallback(async (user: AuthUser) => {
    authUserRef.current = user;
    setAuthUser(user);
    await migrateGuestSession();
    const action = postAuthActionRef.current;
    postAuthActionRef.current = null;
    if (action === "new-research") navigate("/onboarding");
  }, [migrateGuestSession, navigate]);

  /* ── Load Supabase session list when history opens ──────────────── */
  useEffect(() => {
    if (!isHistoryOpen || !authUserRef.current) return;
    setLoadingHistory(true);
    sbLoadSessionList()
      .then((list) => { if (list) setSbSessionItems(list); })
      .finally(() => setLoadingHistory(false));
  }, [isHistoryOpen]);

  useEffect(() => {
    saveChatMessages(messages);
    updateActiveSession({ chatMessages: messages as StoredMessage[] });

    /* Supabase: append only newly added messages (fire-and-forget) */
    const sid = getActiveSessionId();
    if (authUserRef.current && sid) {
      const newMsgs = messages.slice(prevMsgCountRef.current);
      for (const msg of newMsgs) {
        if (msg.role === "user" || msg.role === "ai") {
          sbAppendMessage(sid, msg as StoredMessage).catch(() => {});
        }
      }
    }
    prevMsgCountRef.current = messages.length;

    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isSending) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending]);

  /* ── Shared helper: handle the API response shape ─────────────── */
  const handleRefineResponse = useCallback((data: {
    type: "answer" | "proposed_update";
    message: string;
    proposedAudienceMap: AudienceMapResult | null;
    suggestedActions: string[];
  }) => {
    if (data.type === "proposed_update" && data.proposedAudienceMap) {
      if (pendingUpdateRef.current !== null) {
        setMessages((prev) => [...prev, {
          id: ++msgId.current, role: "ai",
          text: "Please confirm or dismiss the current proposed update before requesting another change.",
        }]);
        return;
      }
      const confirmId = ++msgId.current;
      pendingMapRef.current = data.proposedAudienceMap;
      pendingUpdateRef.current = confirmId;
      setPendingUpdateId(confirmId);
      setMessages((prev) => [...prev, {
        id: confirmId, role: "confirm",
        text: data.message, proposedMap: data.proposedAudienceMap ?? undefined,
      }]);
      setSuggestedChips([]);
    } else {
      setMessages((prev) => [...prev, { id: ++msgId.current, role: "ai", text: data.message }]);
      const actions = data.suggestedActions ?? [];
      const unique = [...new Set(actions.map((a: string) => a.trim()).filter(Boolean))].slice(0, 3);
      setSuggestedChips(unique);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callRefineAPI = async (text: string) => {
    /* Guest-mode: track message count + trigger soft prompt once at 3 */
    if (!authUserRef.current) {
      const count = incGuestChatCount();
      if (count === 3 && !getSoftPromptSeenAt(3)) {
        setIsSoftPromptOpen(true);
      }
    }

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

      handleRefineResponse(data);
    } catch {
      setMessages((prev) => [...prev, {
        id: ++msgId.current, role: "ai",
        text: "I'm having trouble reaching the server. Your audience map is safe — try again in a moment.",
      }]);
    }
  };

  /* ── Attachment upload API ─────────────────────────────────────── */
  const callRefineWithAttachmentsAPI = async (text: string, files: File[]) => {
    /* Guest-mode: also track attachment messages */
    if (!authUserRef.current) {
      const count = incGuestChatCount();
      if (count === 3 && !getSoftPromptSeenAt(3)) {
        setIsSoftPromptOpen(true);
      }
    }

    const displayText = text || "Use this as evidence for my audience research.";
    const suffix = files.length === 1 ? " [1 attachment]" : ` [${files.length} attachments]`;
    setMessages((prev) => [...prev, {
      id: ++msgId.current, role: "user",
      text: displayText + suffix,
    }]);

    try {
      const fd = new FormData();
      fd.append("onboardingData", JSON.stringify(ob ?? {}));
      fd.append("currentAudienceMap", JSON.stringify(audienceMap));
      fd.append("messages", JSON.stringify(messages.slice(-10).map((m) => ({ role: m.role, text: m.text }))));
      fd.append("userMessage", displayText);
      for (const f of files) fd.append("files", f);

      const res = await fetch("/api/chat/refine-with-attachments", { method: "POST", body: fd });
      const data = await res.json() as {
        type: "answer" | "proposed_update";
        message: string;
        proposedAudienceMap: AudienceMapResult | null;
        suggestedActions: string[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `API ${res.status}`);
      handleRefineResponse(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Upload failed.";
      setMessages((prev) => [...prev, {
        id: ++msgId.current, role: "ai",
        text: errMsg.startsWith("File") || errMsg.startsWith('"')
          ? errMsg
          : "I received the attachment but couldn't analyse it. Tell me what to focus on and I'll use it as context.",
      }]);
    }
  };

  /* ── File input handler ────────────────────────────────────────── */
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "text/plain"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const invalid = selected.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setAttachmentError(`"${invalid.name}" is not supported. Use PNG, JPEG, WebP, or plain text.`);
      return;
    }
    const tooBig = selected.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) {
      setAttachmentError(`"${tooBig.name}" exceeds the 5 MB limit.`);
      return;
    }
    const next = [...pendingAttachments, ...selected].slice(0, 3);
    if (pendingAttachments.length + selected.length > 3) {
      setAttachmentError("Max 3 attachments per message.");
    } else {
      setAttachmentError(null);
    }
    setPendingAttachments(next);
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    const hasAttachments = pendingAttachments.length > 0;
    if (!text && !hasAttachments) return;
    if (isSending) return;
    setChatInput("");
    const filesToSend = [...pendingAttachments];
    setPendingAttachments([]);
    setAttachmentError(null);
    setIsSending(true);
    try {
      if (hasAttachments) {
        await callRefineWithAttachmentsAPI(text, filesToSend);
      } else {
        await callRefineAPI(text);
      }
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
      updateActiveSession({ audienceMap: map });
      /* Supabase: persist confirmed map */
      const sid = getActiveSessionId();
      if (authUserRef.current && sid) sbUpdateMap(sid, map).catch(() => {});
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

  /* ── Session switching ──────────────────────────────────────────── */
  const switchSession = useCallback(async (session: ResearchSession) => {
    setActiveSessionId(session.id);
    setActiveSessionIdState(session.id);

    /* If signed in, try to load the full session from Supabase */
    let fullSession = session;
    if (authUserRef.current) {
      const sb = await sbLoadFullSession(session.id);
      if (sb) {
        fullSession = sb;
        upsertSession(fullSession); /* keep localStorage cache fresh */
      }
    }

    /* Write compat keys so single-session helpers stay in sync */
    try { localStorage.setItem("audense_onboarding", JSON.stringify(fullSession.onboardingData)); } catch {}
    saveAudienceMap(fullSession.audienceMap);
    saveChatMessages(fullSession.chatMessages as Message[]);
    /* Hydrate React state */
    setOb(fullSession.onboardingData);
    setAudienceMap(fullSession.audienceMap);
    setSegments(buildSegmentsFromMap(fullSession.audienceMap));
    setMessages(fullSession.chatMessages as Message[]);
    prevMsgCountRef.current = fullSession.chatMessages.length;
    /* Clear any pending AI updates so they don't bleed across sessions */
    pendingUpdateRef.current = null;
    pendingMapRef.current = null;
    setPendingUpdateId(null);
    setSuggestedChips([]);
    setIsHistoryOpen(false);
  }, []);

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
        "Who are my competitors?",
      ];
    }
    return ["Who should I target first?", "Where do I find them?", "What message works?", "Who are my competitors?"];
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
    /* Competitor chip opens the drawer directly if data is present */
    if (chip === "Who are my competitors?" && audienceMap.competitors) {
      setShowCompetitorDrawer(true);
      return;
    }
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
    {isHistoryOpen && (
      <HistoryPanel
        onClose={() => setIsHistoryOpen(false)}
        onSelect={switchSession}
        activeSessionId={activeSessionId}
        sessions={authUser ? sbSessionItems : undefined}
        loading={loadingHistory}
        isGuest={!authUser}
        onSignUp={() => {
          setIsHistoryOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    )}
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        fontFamily: "Inter, sans-serif",
        background: "#F9F8FF",
        overflow: "hidden",
      }}
    >
      {/* ── Mobile tab bar ─────────────────────────────────── */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderBottom: "1px solid #E5E7EB",
            flexShrink: 0,
            padding: "0 8px",
            gap: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (authUser) { navigate("/"); return; }
              const hasResearch = !!activeSessionId || loadSessions().length > 0 || !!getActiveSession() || !!ob?.productIdea || !!loadOnboarding() || messages.length > 2 || hasGuestResearch();
              if (hasResearch) { setIsLeaveConfirmOpen(true); } else { navigate("/"); }
            }}
            style={{ background: "none", border: "none", padding: 8, cursor: "pointer", flexShrink: 0 }}
          >
            <img src={logoImg} alt="AudienceIQ" width={28} height={28} style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6 }} />
          </button>
          {([
            { key: "chat" as const, label: "Chat", icon: <MessageSquare size={15} /> },
            { key: "map" as const, label: "Map", icon: <BarChart3 size={15} /> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom: mobileTab === tab.key ? "2px solid #7C3AED" : "2px solid transparent",
                color: mobileTab === tab.key ? "#7C3AED" : "#6B7280",
                fontWeight: mobileTab === tab.key ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <button type="button" onClick={() => setIsHistoryOpen(v => !v)} title="History" style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: isHistoryOpen ? "#7C3AED" : "#9CA3AF" }}>
              <Layers size={16} />
            </button>
            {!authUser && (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} title="Sign in" style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: "#9CA3AF" }}>
                <User size={16} />
              </button>
            )}
            <button type="button" onClick={() => setIsSettingsOpen(true)} title="Settings" style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: "#9CA3AF" }}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Left panel ─────────────────────────────────────── */}
      <div
        style={{
          width: isMobile ? "100%" : `${splitPct}%`,
          flexShrink: 0,
          display: isMobile && mobileTab !== "chat" ? "none" : "flex",
          flex: isMobile ? 1 : undefined,
          background: "#fff",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* ── Icon rail ────────────────────────────────────── */}
        <div
          style={{
            width: 64,
            flexShrink: 0,
            display: isMobile ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRight: "1px solid #E5E7EB",
            paddingTop: 12,
            paddingBottom: 14,
            background: "#fff",
          }}
        >
          {/* Logo — clickable, navigates to landing route. For *guests with
              active research* we surface a confirmation modal first so they
              don't lose their unsaved work by accident. Signed-in users and
              guests with no research go straight to `/`. This action never
              signs out, clears local session data, or opens the auth modal
              directly. */}
          <button
            type="button"
            onClick={() => {
              /* Signed-in: always navigate immediately. Their work is
                 already persisted to Supabase. */
              if (authUser) {
                navigate("/");
                return;
              }
              /* Guest active-research detection. Any of: an active session
                 id, an existing local session, onboarding/product data,
                 the guest-research flag, or a non-trivial chat (>2
                 messages — guards against the seeded welcome turns). */
              const hasLocalSession =
                !!activeSessionId ||
                loadSessions().length > 0 ||
                !!getActiveSession();
              const hasOnboarding = !!ob?.productIdea || !!loadOnboarding();
              const hasMeaningfulChat = messages.length > 2;
              const hasResearch =
                hasLocalSession || hasOnboarding || hasGuestResearch() || hasMeaningfulChat;
              if (hasResearch) {
                setIsLeaveConfirmOpen(true);
              } else {
                navigate("/");
              }
            }}
            aria-label="Go to AudienceIQ home"
            title="Home"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              marginBottom: 20,
              cursor: "pointer",
              flexShrink: 0,
              borderRadius: 8,
              lineHeight: 0,
            }}
          >
            <img
              src={logoImg}
              alt="AudienceIQ"
              width={36}
              height={36}
              decoding="sync"
              loading="eager"
              fetchPriority="high"
              style={{ width: 36, height: 36, objectFit: "contain", display: "block" }}
            />
          </button>
          {/* Top nav icons */}
          <RailIcon icon={<Home size={18} />} label="Home" active onClick={() => {}} />
          <RailIcon
            icon={<Layers size={18} />}
            label="Research history"
            active={isHistoryOpen}
            onClick={() => setIsHistoryOpen((v) => !v)}
          />
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Sign-in shortcut — only visible when not signed in */}
          {!authUser && (
            <RailIcon
              icon={<User size={18} />}
              label="Sign in to save research"
              onClick={() => setIsAuthModalOpen(true)}
            />
          )}
          {/* Settings */}
          <RailIcon
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => setIsSettingsOpen(true)}
          />
          {/* Help popover */}
          <div style={{ position: "relative" }}>
            {isHelpPopoverOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 9000 }}
                  onClick={() => setIsHelpPopoverOpen(false)}
                />
                <div
                  style={{
                    position: "absolute", bottom: 0, left: "calc(100% + 8px)",
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
            <RailIcon
              icon={<HelpCircle size={18} />}
              label="Help"
              onClick={() => setIsHelpPopoverOpen((v) => !v)}
            />
          </div>
        </div>

        {/* ── Chat area ────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >

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
                  padding: "8px 12px",
                  fontSize: 12,
                  lineHeight: 1.25,
                  fontWeight: isConfirm || isDismiss ? 600 : 500,
                  color: disabled ? "#9CA3AF" : accentColor,
                  cursor: disabled ? "not-allowed" : "pointer",
                  whiteSpace: "normal",
                  maxWidth: 220,
                  textAlign: "left",
                  wordBreak: "break-word",
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.txt"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {/* Attachment chips */}
          {pendingAttachments.length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6,
              marginBottom: 8, minWidth: 0,
            }}>
              {pendingAttachments.map((f, i) => {
                const isImage = f.type.startsWith("image/");
                return (
                  <div
                    key={`${f.name}-${i}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 8px 4px 7px",
                      background: "#F5F3FF", border: "1px solid #DDD6FE",
                      borderRadius: 20, maxWidth: 180,
                    }}
                  >
                    {isImage
                      ? <Image size={11} style={{ color: "#7C3AED", flexShrink: 0 }} />
                      : <FileText size={11} style={{ color: "#7C3AED", flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: 11.5, color: "#5B21B6", fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: 120,
                    }}>
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAttachments((prev) => prev.filter((_, j) => j !== i));
                        setAttachmentError(null);
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, flexShrink: 0, color: "#9CA3AF",
                      }}
                    >
                      <XIcon size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Attachment error */}
          {attachmentError && (
            <div style={{
              fontSize: 11.5, color: "#B91C1C", background: "#FEF2F2",
              border: "1px solid #FECACA", borderRadius: 8,
              padding: "5px 10px", marginBottom: 8,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
              <span>{attachmentError}</span>
              <button
                type="button"
                onClick={() => setAttachmentError(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}
              >
                <XIcon size={11} />
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#F9FAFB",
              border: "1.5px solid #E5E7EB",
              borderRadius: 999,
              padding: "7px 7px 7px 8px",
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
            <button
              type="button"
              title="Attach file"
              disabled={isSending || pendingAttachments.length >= 3}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none", padding: "2px",
                cursor: isSending || pendingAttachments.length >= 3 ? "not-allowed" : "pointer",
                flexShrink: 0, borderRadius: 4,
                color: pendingAttachments.length > 0 ? "#7C3AED" : "#9CA3AF",
                opacity: pendingAttachments.length >= 3 ? 0.4 : 1,
              }}
            >
              <Paperclip size={14} />
            </button>
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
              disabled={(!chatInput.trim() && pendingAttachments.length === 0) || isSending || pendingUpdateId !== null}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: ((!chatInput.trim() && pendingAttachments.length === 0) || isSending || pendingUpdateId !== null) ? "#C4B5FD" : "#7C3AED",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: ((!chatInput.trim() && pendingAttachments.length === 0) || isSending || pendingUpdateId !== null) ? "not-allowed" : "pointer",
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
            AudienceIQ can make mistakes. Verify important insights.
          </div>
        </div>

        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      {!isMobile && (
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
      )}

      {/* ── Right panel ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: isMobile && mobileTab !== "map" ? "none" : "flex",
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
                        animation: "spin 0.7s linear infinite",
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
                onClick={() => {
                  if (!authUserRef.current && hasGuestResearch()) {
                    setIsNewResearchAuthWall(true);
                  } else {
                    navigate("/onboarding");
                  }
                }}
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
                  Covered {audienceMap.coverage.percent}%
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
                  Untapped {audienceMap.untapped.percent}%
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

    <SettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      authUser={authUser}
      onSignIn={() => { setIsSettingsOpen(false); setIsAuthModalOpen(true); }}
      onSignOut={() => {
        setIsSettingsOpen(false);
        signOut().then(() => {
          setSbSessionItems([]);
          navigate("/");
        });
      }}
    />
    <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
    {isAuthModalOpen && (
      <AuthModal
        onClose={() => setIsAuthModalOpen(false)}
        onAuth={handleAuth}
      />
    )}
    {isSoftPromptOpen && (
      <SoftPromptModal
        onPrimary={() => {
          setIsSoftPromptOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSecondary={() => {
          setSoftPromptSeenAt(3);
          setIsSoftPromptOpen(false);
        }}
      />
    )}
    {isLeaveConfirmOpen && (
      <LeavingDashboardConfirm
        onPrimary={() => {
          /* Save my history → open existing sign-up modal. Do not nav. */
          setIsLeaveConfirmOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSecondary={() => {
          /* Continue without saving → go to landing. Local guest data is
             intentionally preserved so the guest can come back to /dashboard
             and find their work intact. */
          setIsLeaveConfirmOpen(false);
          navigate("/");
        }}
        onCancel={() => setIsLeaveConfirmOpen(false)}
      />
    )}
    {isNewResearchAuthWall && (
      <NewResearchAuthWall
        onPrimary={() => {
          postAuthActionRef.current = "new-research";
          setIsNewResearchAuthWall(false);
          setIsAuthModalOpen(true);
        }}
        onSecondary={() => setIsNewResearchAuthWall(false)}
      />
    )}
    {showCompetitorDrawer && audienceMap.competitors && (
      <CompetitorDrawer
        competitors={audienceMap.competitors}
        productSummary={audienceMap.productSummary}
        onClose={() => setShowCompetitorDrawer(false)}
      />
    )}
    </>
  );
}
