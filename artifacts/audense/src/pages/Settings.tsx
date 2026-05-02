import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";

/* ─── localStorage helpers ───────────────────────────────────────── */
function ls(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function lsBool(key: string, fallback: boolean): boolean {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  return v === "true";
}
function lsJson<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

/* ─── Constants ──────────────────────────────────────────────────── */
const REGIONS = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Global"];
const CATEGORIES = ["Health & Fitness", "SaaS / Software", "E-commerce", "Education", "Finance", "Creator Tools", "Consumer Apps", "Other"];
const SOURCES: { label: string; live: boolean }[] = [
  { label: "Hacker News", live: true },
  { label: "Reddit", live: false },
  { label: "X / Twitter", live: false },
  { label: "TikTok", live: false },
  { label: "YouTube", live: false },
  { label: "Review sites", live: false },
  { label: "Competitor websites", live: false },
];

/* ─── Sub-components ─────────────────────────────────────────────── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid #F3F4F6",
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.01em" }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 5, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  border: "1px solid #E5E7EB",
  fontSize: 13.5,
  color: "#111827",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#F9FAFB",
  color: "#9CA3AF",
  cursor: "not-allowed",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
  cursor: "pointer",
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        border: "none",
        background: value ? "#7C3AED" : "#D1D5DB",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: value ? 21 : 3,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#111827" }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function DangerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 9,
        border: "1px solid #FCA5A5",
        background: "#FEF2F2",
        color: "#991B1B",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function Settings() {
  const [, navigate] = useLocation();
  const [saved, setSaved] = useState(false);

  /* Account */
  const [displayName, setDisplayName] = useState(() => ls("audense-display-name", "Founder"));
  const [workspaceName, setWorkspaceName] = useState(() => ls("audense-workspace-name", "My Audience Workspace"));

  /* Research */
  const [defaultRegion, setDefaultRegion] = useState(() => ls("audense-default-region", "United Kingdom"));
  const [defaultCategory, setDefaultCategory] = useState(() => ls("audense-default-category", "Consumer Apps"));
  const [preferredSources, setPreferredSources] = useState<string[]>(() =>
    lsJson("audense-preferred-sources", ["Hacker News"])
  );

  /* Chat */
  const [responseStyle, setResponseStyle] = useState(() => ls("audense-response-style", "Balanced"));
  const [allowMapUpdates, setAllowMapUpdates] = useState(() => lsBool("audense-allow-map-updates", true));
  const [showSuggestedActions, setShowSuggestedActions] = useState(() => lsBool("audense-show-suggested-actions", true));

  const save = useCallback(() => {
    try {
      localStorage.setItem("audense-display-name", displayName);
      localStorage.setItem("audense-workspace-name", workspaceName);
      localStorage.setItem("audense-default-region", defaultRegion);
      localStorage.setItem("audense-default-category", defaultCategory);
      localStorage.setItem("audense-preferred-sources", JSON.stringify(preferredSources));
      localStorage.setItem("audense-response-style", responseStyle);
      localStorage.setItem("audense-allow-map-updates", String(allowMapUpdates));
      localStorage.setItem("audense-show-suggested-actions", String(showSuggestedActions));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }, [displayName, workspaceName, defaultRegion, defaultCategory, preferredSources, responseStyle, allowMapUpdates, showSuggestedActions]);

  /* Auto-save toggle changes immediately */
  useEffect(() => { try { localStorage.setItem("audense-allow-map-updates", String(allowMapUpdates)); } catch {} }, [allowMapUpdates]);
  useEffect(() => { try { localStorage.setItem("audense-show-suggested-actions", String(showSuggestedActions)); } catch {} }, [showSuggestedActions]);

  function toggleSource(src: string) {
    setPreferredSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  }

  /* Data & Privacy actions */
  function exportData() {
    const keys = [
      "audense_onboarding", "audense-audience-map", "audense-chat-messages",
      "audense-dashboard-split", "audense-display-name", "audense-workspace-name",
      "audense-default-region", "audense-default-category", "audense-preferred-sources",
      "audense-response-style", "audense-allow-map-updates", "audense-show-suggested-actions",
    ];
    const data: Record<string, unknown> = {};
    keys.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) { try { data[k] = JSON.parse(v); } catch { data[k] = v; } }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audense-export.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function clearChat() {
    if (!window.confirm("Clear all chat history? This cannot be undone.")) return;
    localStorage.removeItem("audense-chat-messages");
  }

  function clearMap() {
    if (!window.confirm("Clear the current audience map? You can regenerate it by starting new research.")) return;
    localStorage.removeItem("audense-audience-map");
  }

  function resetOnboarding() {
    if (!window.confirm("Reset all onboarding data and your current audience map? You'll need to run onboarding again.")) return;
    localStorage.removeItem("audense_onboarding");
    localStorage.removeItem("audense-audience-map");
    navigate("/onboarding");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #F3F4F6",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", padding: "4px 0",
              fontSize: 13.5, fontWeight: 500, color: "#6B7280", cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Settings</span>
        </div>
        <button
          onClick={save}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: saved ? "#ECFDF5" : "#7C3AED",
            border: "none", borderRadius: 9,
            padding: "8px 18px", fontSize: 13, fontWeight: 600,
            color: saved ? "#065F46" : "#fff", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {saved ? <><Check size={13} /> Saved</> : "Save changes"}
        </button>
      </div>

      {/* Page body */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 56px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* A — Account */}
        <Card title="Account">
          <Field label="Display name">
            <input
              style={inputStyle}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Founder"
            />
          </Field>
          <Field label="Workspace name">
            <input
              style={inputStyle}
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Audience Workspace"
            />
          </Field>
          <Field label="Email" hint="Connect an account later to sync across devices.">
            <input style={disabledInputStyle} value="Not connected yet" disabled />
          </Field>
        </Card>

        {/* B — Research Preferences */}
        <Card title="Research preferences">
          <Field label="Default region">
            <select
              style={selectStyle}
              value={defaultRegion}
              onChange={(e) => setDefaultRegion(e.target.value)}
            >
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Default category">
            <select
              style={selectStyle}
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Preferred sources" hint="Only Hacker News is currently live. Others are coming soon.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
              {SOURCES.map(({ label, live }) => {
                const checked = preferredSources.includes(label);
                return (
                  <label
                    key={label}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: live ? "pointer" : "default",
                      opacity: live ? 1 : 0.6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!live}
                      onChange={() => live && toggleSource(label)}
                      style={{ accentColor: "#7C3AED", width: 15, height: 15, cursor: live ? "pointer" : "not-allowed" }}
                    />
                    <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500 }}>{label}</span>
                    {!live && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, color: "#9CA3AF",
                        background: "#F3F4F6", borderRadius: 5,
                        padding: "2px 6px", letterSpacing: "0.03em",
                      }}>
                        Coming soon
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </Field>
        </Card>

        {/* C — Chat Preferences */}
        <Card title="Chat preferences">
          <Field label="Response style">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Concise", "Balanced", "Detailed"].map((opt) => {
                const active = responseStyle === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setResponseStyle(opt)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border: `1.5px solid ${active ? "#7C3AED" : "#E5E7EB"}`,
                      background: active ? "#F5F3FF" : "#fff",
                      color: active ? "#7C3AED" : "#374151",
                      fontSize: 13, fontWeight: active ? 600 : 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>
          <ToggleRow
            label="Allow map update suggestions"
            hint="Audense may suggest updating your audience map based on chat context."
            value={allowMapUpdates}
            onChange={setAllowMapUpdates}
          />
          <ToggleRow
            label="Show suggested follow-up chips"
            hint="Quick-action chips appear below AI responses to guide next steps."
            value={showSuggestedActions}
            onChange={setShowSuggestedActions}
          />
        </Card>

        {/* D — Data & Privacy */}
        <Card title="Data & privacy">
          <div style={{
            background: "#F9FAFB", border: "1px solid #E5E7EB",
            borderRadius: 10, padding: "12px 14px",
            fontSize: 13, color: "#6B7280", lineHeight: 1.65,
          }}>
            Your current MVP data is stored locally in this browser. When accounts are added, you'll be able to sync projects across devices.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              onClick={exportData}
              style={{
                padding: "9px 14px", borderRadius: 9,
                border: "1px solid #DDD6FE", background: "#F5F3FF",
                color: "#6D28D9", fontSize: 13, fontWeight: 500,
                cursor: "pointer", textAlign: "left", width: "100%",
              }}
            >
              Export local data — download all stored data as JSON
            </button>
            <DangerButton label="Clear chat history" onClick={clearChat} />
            <DangerButton label="Clear current audience map" onClick={clearMap} />
            <DangerButton label="Reset onboarding data" onClick={resetOnboarding} />
          </div>
        </Card>

        {/* E — About */}
        <Card title="About Audense">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: -0.3 }}>Audense</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: "#7C3AED",
                background: "#F5F3FF", borderRadius: 6, padding: "3px 8px",
              }}>
                MVP Preview
              </span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#6B7280", lineHeight: 1.65 }}>
              Audense helps founders turn product ideas into audience maps, research hypotheses, and go-to-market direction.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
