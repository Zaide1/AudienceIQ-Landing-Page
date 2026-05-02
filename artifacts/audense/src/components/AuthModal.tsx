import { useState } from "react";
import { signIn, signUp, type AuthUser } from "../lib/auth";

interface Props {
  onClose: () => void;
  onAuth:  (user: AuthUser) => void;
}

type Tab = "signin" | "signup";

export function AuthModal({ onClose, onAuth }: Props) {
  const [tab, setTab]           = useState<Tab>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        const { user, error: err } = await signUp(email, password, name);
        if (err) { setError(err); return; }
        if (user) { onAuth(user); onClose(); }
        else setError("Check your email to confirm your account, then sign in.");
      } else {
        const { user, error: err } = await signIn(email, password);
        if (err) { setError(err); return; }
        if (user) { onAuth(user); onClose(); }
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #E5E7EB",
    fontSize: 13.5, color: "#111827",
    outline: "none", fontFamily: "Inter, sans-serif",
    background: "#FAFAFA",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "10px 0", borderRadius: 9,
    background: "#7C3AED", color: "#fff",
    border: "none", cursor: loading ? "not-allowed" : "pointer",
    fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1,
    fontFamily: "Inter, sans-serif",
  };

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9100, background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 9101, width: 380,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
          padding: "28px 28px 24px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
              {tab === "signin" ? "Sign in to Audense" : "Create your account"}
            </div>
            <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 3 }}>
              {tab === "signin"
                ? "Your research sessions sync across devices."
                : "Free — your research saves automatically."}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "#F3F4F6", borderRadius: 7,
              width: 28, height: 28, cursor: "pointer", fontSize: 17,
              color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", borderRadius: 9, padding: 3, marginBottom: 20 }}>
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 7,
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#111827" : "#6B7280",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                Your name
              </label>
              <input
                type="text"
                required
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 8, padding: "9px 12px",
              fontSize: 13, color: "#B91C1C", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Please wait…" : tab === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Local demo note */}
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.5 }}>
          You can also continue without an account — your research saves locally in this browser.
        </div>
      </div>
    </>
  );
}
