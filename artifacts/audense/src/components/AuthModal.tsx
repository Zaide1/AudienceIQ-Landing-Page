import { useRef, useState } from "react";
import { signIn, signUp, type AuthUser } from "../lib/auth";

interface Props {
  onClose: () => void;
  onAuth:  (user: AuthUser) => void;
}

type Tab = "signin" | "signup";

interface FieldErrors {
  name?:     string;
  email?:    string;
  password?: string;
}

function friendlySupabaseError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "That email or password doesn't look right.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account already exists for this email.";
  return msg;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function AuthModal({ onClose, onAuth }: Props) {
  const [tab, setTab]           = useState<Tab>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);

  const nameRef     = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function clearField(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const errs: FieldErrors = {};

    if (tab === "signup" && !name.trim()) {
      errs.name = "Enter your name.";
    }

    if (!email.trim()) {
      errs.email = "Enter your email.";
    } else if (!isValidEmail(email)) {
      errs.email = "Enter a valid email address.";
    }

    if (!password) {
      errs.password = "Enter your password.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errs);

    /* Focus the first invalid field */
    if (errs.name)     { nameRef.current?.focus();     return false; }
    if (errs.email)    { emailRef.current?.focus();    return false; }
    if (errs.password) { passwordRef.current?.focus(); return false; }

    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (tab === "signup") {
        const { user, error: err } = await signUp(email, password, name);
        if (err) { setFormError(friendlySupabaseError(err)); return; }
        if (user) { onAuth(user); onClose(); }
        else setFormError("Check your email to confirm your account, then sign in.");
      } else {
        const { user, error: err } = await signIn(email, password);
        if (err) { setFormError(friendlySupabaseError(err)); return; }
        if (user) { onAuth(user); onClose(); }
      }
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setFormError(null);
    setFieldErrors({});
  }

  /* ── Style helpers ─────────────────────────────────────────── */
  function inputStyle(field: keyof FieldErrors): React.CSSProperties {
    const hasErr = !!fieldErrors[field];
    return {
      width: "100%", boxSizing: "border-box",
      padding: "9px 12px", borderRadius: 8,
      border: `1.5px solid ${hasErr ? "#F87171" : "#E5E7EB"}`,
      fontSize: 13.5, color: "#111827",
      outline: "none", fontFamily: "Inter, sans-serif",
      background: hasErr ? "#FFF8F8" : "#FAFAFA",
      transition: "border-color 0.15s, background 0.15s",
    };
  }

  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "10px 0", borderRadius: 9,
    background: "#7C3AED", color: "#fff",
    border: "none", cursor: loading ? "not-allowed" : "pointer",
    fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1,
    fontFamily: "Inter, sans-serif",
  };

  const fieldErrStyle: React.CSSProperties = {
    fontSize: 11.5, color: "#DC2626", marginTop: 4, lineHeight: 1.4,
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
              onClick={() => switchTab(t)}
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

        {/* Form — noValidate suppresses all browser-native bubbles */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                Your name
              </label>
              <input
                ref={nameRef}
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => { setName(e.target.value); clearField("name"); }}
                style={inputStyle("name")}
              />
              {fieldErrors.name && <div style={fieldErrStyle}>{fieldErrors.name}</div>}
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
              style={inputStyle("email")}
            />
            {fieldErrors.email && <div style={fieldErrStyle}>{fieldErrors.email}</div>}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Password
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
              style={inputStyle("password")}
            />
            {fieldErrors.password && <div style={fieldErrStyle}>{fieldErrors.password}</div>}
          </div>

          {formError && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 8, padding: "9px 12px",
              fontSize: 13, color: "#B91C1C", lineHeight: 1.5,
            }}>
              {formError}
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
