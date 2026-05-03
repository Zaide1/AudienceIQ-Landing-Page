import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, User, Search, MessageSquare, Database, LogOut } from "lucide-react";
import { loadAudienceMap, type AudienceMapResult } from "../lib/audienceMap";

interface AuthUser { email: string; id: string; }

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

/* ─── tab definitions ────────────────────────────────────────────── */
type Tab = "profile" | "research" | "chat" | "data";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",  label: "Profile",  icon: <User size={15} /> },
  { id: "research", label: "Research", icon: <Search size={15} /> },
  { id: "chat",     label: "Chat",     icon: <MessageSquare size={15} /> },
  { id: "data",     label: "Data",     icon: <Database size={15} /> },
];

/* ─── tab content components ─────────────────────────────────────── */
function ProfileTab({
  displayName, authUser, onSignIn, onSignOut,
}: {
  displayName: string;
  authUser: AuthUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Profile</div>

      {authUser ? (
        /* ── Signed-in state ─────────────────────────────────────── */
        <>
          <div style={{ ...ROW, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#fff", fontWeight: 700, flexShrink: 0,
            }}>
              {(authUser.email.charAt(0) || "U").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{authUser.email}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Signed in</div>
            </div>
          </div>

          <FieldRow label="Email">
            <input style={DISABLED_INPUT} value={authUser.email} disabled />
          </FieldRow>

          <FieldRow label="Name">
            <input style={DISABLED_INPUT} value={displayName} disabled />
          </FieldRow>

          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={onSignOut}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 16px", borderRadius: 8,
                border: "1px solid #FCA5A5", background: "#FEF2F2",
                color: "#991B1B", fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>
      ) : (
        /* ── Guest state ─────────────────────────────────────────── */
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", borderRadius: 10,
            background: "#F9FAFB", border: "1px solid #E5E7EB", marginBottom: 20,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#F3F4F6", border: "1px solid #E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <User size={20} style={{ color: "#9CA3AF" }} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>Guest session</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Research is saved locally in this browser only.</div>
            </div>
          </div>

          <div style={{
            background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10,
            padding: "14px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#5B21B6", marginBottom: 6 }}>
              Save your research to an account
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 14 }}>
              Create a free account to save this map and chat, access it from any device, and start multiple research projects.
            </div>
            <button
              type="button"
              onClick={onSignIn}
              style={{
                padding: "9px 18px", borderRadius: 8,
                background: "#7C3AED", color: "#fff",
                border: "none", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Create free account
            </button>
          </div>

          <FieldRow label="Name">
            <input style={DISABLED_INPUT} value={displayName} disabled />
          </FieldRow>
        </>
      )}
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
      <div style={HINT}>AudienceIQ estimates are directional and should be validated with real users.</div>
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
        AudienceIQ uses your onboarding data, current audience map, and recent chat context to answer. It should not answer unrelated questions.
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

/* ─── Main modal ─────────────────────────────────────────────────── */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser?: AuthUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function SettingsModal({ isOpen, onClose, authUser = null, onSignIn, onSignOut }: SettingsModalProps) {
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
          {activeTab === "profile"  && <ProfileTab displayName={displayName} authUser={authUser} onSignIn={onSignIn ?? (() => {})} onSignOut={onSignOut ?? (() => {})} />}
          {activeTab === "research" && <ResearchTab map={map} />}
          {activeTab === "chat"     && <ChatTab />}
          {activeTab === "data"     && <DataTab />}
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
