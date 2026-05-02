import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, User, Search, MessageSquare, Database, HelpCircle } from "lucide-react";
import { loadAudienceMap, type AudienceMapResult } from "../lib/audienceMap";

/* ─── helpers ─────────────────────────────────────────────────────── */
function ls(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

/* ─── shared primitives ─────────────────────────────────────────── */
const ROW: React.CSSProperties = { marginBottom: 20 };
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600, color: "#52525B",
  letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6,
};
const DISABLED_INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #E5E7EB", fontSize: 13.5, color: "#71717A",
  background: "#FAFAFA", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};
const DISABLED_TEXTAREA: React.CSSProperties = {
  ...DISABLED_INPUT, resize: "none", minHeight: 68, lineHeight: 1.55,
};
const HINT: React.CSSProperties = {
  fontSize: 11.5, color: "#9CA3AF", marginTop: 5, lineHeight: 1.55,
};
const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11.5, fontWeight: 700, color: "#7C3AED",
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 12, marginTop: 8,
};
const DIVIDER: React.CSSProperties = {
  borderBottom: "1px solid #F3F4F6", marginBottom: 20, marginTop: 4,
};
const BTN_DANGER: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid #FCA5A5",
  background: "#FEF2F2", color: "#991B1B", fontSize: 13, fontWeight: 500,
  cursor: "pointer", transition: "background 0.15s",
};

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={ROW}>
      <label style={LABEL}>{label}</label>
      {children}
      {hint && <div style={HINT}>{hint}</div>}
    </div>
  );
}

function DisabledToggleRow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500 }}>{label}</span>
      <div style={{
        width: 36, height: 20, borderRadius: 10, background: "#7C3AED",
        position: "relative", opacity: 0.5, cursor: "not-allowed",
      }}>
        <span style={{
          position: "absolute", top: 2, left: 18, width: 16, height: 16,
          borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>
    </div>
  );
}

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

/* ─── tab definitions ────────────────────────────────────────────── */
type Tab = "profile" | "research" | "chat" | "data" | "help";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",  label: "Profile",  icon: <User size={15} /> },
  { id: "research", label: "Research", icon: <Search size={15} /> },
  { id: "chat",     label: "Chat",     icon: <MessageSquare size={15} /> },
  { id: "data",     label: "Data",     icon: <Database size={15} /> },
  { id: "help",     label: "Help",     icon: <HelpCircle size={15} /> },
];

const FAQ = [
  { q: "What is Reachable Audience?",      a: "A directional estimate of people Audense thinks are reachable for your product, category, and region. It's a starting hypothesis, not official market-size data." },
  { q: "What is Est. Coverage?",            a: "The share of your reachable audience your current positioning is likely to address first. This is an MVP estimate based on category benchmarks and product specificity." },
  { q: "What is Untapped Opportunity?",     a: "The remaining audience potential outside your early focus. It's calculated by subtracting estimated coverage from your total reachable audience." },
  { q: "What is Confidence?",               a: "How reliable this map is, based on how much onboarding detail you provided, the source quality, and whether live research signals were used." },
  { q: "What is Audience Universe?",        a: "A visual map showing directional slices of your reachable market. Coloured clusters represent audience segments Audense identified as most relevant." },
  { q: "What does Run live research do?",  a: "Searches connected public sources (currently Hacker News) for real audience signals. Results add supporting evidence to your map but source coverage may be limited." },
  { q: "Why are estimates directional?",   a: "Market sizing at the MVP stage is inherently uncertain. These numbers are hypotheses to help you decide where to test first — not guarantees or official statistics." },
];

/* ─── tab content components ─────────────────────────────────────── */
function ProfileTab({ displayName }: { displayName: string }) {
  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Profile</div>

      <div style={{ ...ROW, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, color: "#fff", fontWeight: 700, flexShrink: 0,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <button
            type="button"
            disabled
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E7EB",
              background: "#FAFAFA", color: "#9CA3AF", fontSize: 13, fontWeight: 500,
              cursor: "not-allowed",
            }}
          >
            Change picture
          </button>
          <div style={HINT}>Profile photos will be available when accounts are enabled.</div>
        </div>
      </div>

      <FieldRow label="Name">
        <input style={DISABLED_INPUT} value={displayName} disabled />
      </FieldRow>

      <FieldRow label="Workspace">
        <input style={DISABLED_INPUT} value="Local demo" disabled />
      </FieldRow>

      <div style={{
        background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10,
        padding: "12px 14px", fontSize: 13, color: "#6B7280", lineHeight: 1.65,
      }}>
        Profiles will become editable after authentication is added.
      </div>
    </>
  );
}

function ResearchTab({ map }: { map: AudienceMapResult | null }) {
  const es = map?.evidenceSummary;
  const sourcesUsed = es?.sourcesUsed ?? [];
  const sourceLabel = sourcesUsed.includes("hacker_news") ? "Hacker News" : "No live sources connected";
  const sourceModeLabel = es?.sourceMode === "live_research" ? "Live research"
    : es?.sourceMode === "ai_hypothesis" ? "AI hypothesis" : "Hypothesis-led";

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Research</div>

      <div style={SECTION_TITLE}>Current research</div>
      <FieldRow label="Product summary">
        <textarea style={DISABLED_TEXTAREA} value={map?.productSummary ?? "No map yet"} disabled />
      </FieldRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FieldRow label="Region">
          <input style={DISABLED_INPUT} value={map?.region ?? "—"} disabled />
        </FieldRow>
        <FieldRow label="Category">
          <input style={DISABLED_INPUT} value={map?.category ?? "—"} disabled />
        </FieldRow>
      </div>
      <FieldRow label="Confidence">
        <input style={DISABLED_INPUT} value={map?.confidence ?? "—"} disabled />
      </FieldRow>

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Sources</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FieldRow label="Source mode">
          <input style={DISABLED_INPUT} value={sourceModeLabel} disabled />
        </FieldRow>
        <FieldRow label="Sources used">
          <input style={DISABLED_INPUT} value={sourceLabel} disabled />
        </FieldRow>
      </div>
      {es?.confidenceReason && (
        <FieldRow label="Confidence reason">
          <input style={DISABLED_INPUT} value={es.confidenceReason} disabled />
        </FieldRow>
      )}
      {es?.limitations && es.limitations.length > 0 && (
        <div style={ROW}>
          <div style={LABEL}>Limitations</div>
          <div style={{
            background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 8,
            padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6,
          }}>
            {es.limitations.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
                <span style={{ color: "#9CA3AF", flexShrink: 0 }}>•</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={HINT}>Audense estimates are directional and should be validated with real users.</div>
    </>
  );
}

function ChatTab() {
  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Chat</div>

      <div style={SECTION_TITLE}>Assistant behaviour</div>
      <FieldRow label="Role">
        <input style={DISABLED_INPUT} value="Audience intelligence coach" disabled />
      </FieldRow>
      <FieldRow label="Scope">
        <input style={DISABLED_INPUT} value="Audience research, positioning, validation, messaging, and go-to-market" disabled />
      </FieldRow>
      <FieldRow label="Memory">
        <input style={DISABLED_INPUT} value="Current research session only" disabled />
      </FieldRow>

      <div style={{
        background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10,
        padding: "12px 14px", fontSize: 13, color: "#6B7280", lineHeight: 1.65, marginBottom: 20,
      }}>
        Audense uses your onboarding data, current audience map, and recent chat context to answer. It should not answer unrelated questions.
      </div>

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Preferences</div>
      <DisabledToggleRow label="Concise responses" />
      <DisabledToggleRow label="Stay on-topic" />
      <DisabledToggleRow label="Suggest next actions" />
      <div style={HINT}>Chat preferences will be configurable when accounts are enabled.</div>
    </>
  );
}

function DataTab() {
  function clearChat() {
    localStorage.removeItem("audense-chat-messages");
  }
  function clearMap() {
    localStorage.removeItem("audense-audience-map");
  }
  function resetAll() {
    if (!window.confirm("Reset all local demo data? This will clear your chat, audience map, and onboarding. This cannot be undone.")) return;
    localStorage.removeItem("audense-chat-messages");
    localStorage.removeItem("audense-audience-map");
    localStorage.removeItem("audense_onboarding");
    window.location.reload();
  }

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Data</div>

      <div style={{
        background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10,
        padding: "12px 14px", fontSize: 13, color: "#6B7280", lineHeight: 1.65, marginBottom: 20,
      }}>
        Your current MVP data is stored locally in this browser only. Clearing it cannot be undone. When accounts are added, you'll be able to sync across devices.
      </div>

      <div style={SECTION_TITLE}>Local demo data</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 9 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#111827" }}>Chat history</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Removes all chat messages</div>
          </div>
          <button type="button" onClick={clearChat} style={BTN_DANGER}>Clear</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 9 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#111827" }}>Audience map</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Removes the current audience map</div>
          </div>
          <button type="button" onClick={clearMap} style={BTN_DANGER}>Clear</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 9 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#111827" }}>Reset local demo data</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Clears chat, map, and onboarding</div>
          </div>
          <button type="button" onClick={resetAll} style={{ ...BTN_DANGER, borderColor: "#F87171", background: "#FEF2F2" }}>Reset all</button>
        </div>
      </div>
    </>
  );
}

function HelpTab() {
  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Help</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Answers to common questions about your audience map.</div>
      {FAQ.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
    </>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────── */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const map = isOpen ? loadAudienceMap() : null;
  const displayName = ls("audense-display-name", "") || ls("audense_onboarding", "{}") && (() => {
    try { return JSON.parse(localStorage.getItem("audense_onboarding") ?? "{}").displayName ?? "Founder"; } catch { return "Founder"; }
  })();

  const close = useCallback(() => {
    setActiveTab("profile");
    onClose();
  }, [onClose]);

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
      aria-label="Settings"
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Modal shell */}
      <div
        style={{
          width: "min(900px, calc(100vw - 40px))",
          height: "min(720px, calc(100vh - 40px))",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(15,23,42,0.22)",
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <div style={{
          width: 190, flexShrink: 0,
          background: "#FBFBFA",
          borderRight: "1px solid #E5E7EB",
          padding: "20px 12px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 10px 10px" }}>
            Settings
          </div>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "0 10px", height: 40, borderRadius: 8, border: "none",
                  background: active ? "#F4F0FF" : "transparent",
                  color: active ? "#7C3AED" : "#52525B",
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ display: "flex", opacity: active ? 1 : 0.7 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {activeTab === "profile"  && <ProfileTab displayName={displayName} />}
          {activeTab === "research" && <ResearchTab map={map} />}
          {activeTab === "chat"     && <ChatTab />}
          {activeTab === "data"     && <DataTab />}
          {activeTab === "help"     && <HelpTab />}
        </div>

        {/* Close */}
        <button
          type="button"
          aria-label="Close settings"
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
