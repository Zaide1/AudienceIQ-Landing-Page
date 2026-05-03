import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";
import { generateMockAudienceMap, saveAudienceMap } from "../lib/audienceMap";
import { createFreshResearchSession, clearGuestSessionStore } from "../lib/researchSessions";
import { sbSaveSession } from "../lib/sbSessions";
import { setHasGuestResearch } from "../lib/guestMode";
import { getCurrentUser } from "../lib/auth";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface OnboardingState {
  productIdea: string;
  targetUsers: string;
  problem: string;
  goal: string;
  category: string;
  customCategory: string;
  region: string;
  customRegion: string;
}

/* ─── Constants ─────────────────────────────────────────────────────── */
const GOALS = [
  { id: "find-audience", icon: "👥", title: "Find target audience", desc: "Discover who your ideal users are and where they are." },
  { id: "validate-idea", icon: "💡", title: "Validate idea", desc: "Understand market demand and validate your idea." },
  { id: "market-research", icon: "📊", title: "Market research", desc: "Get insights about your market, industry and competitors." },
  { id: "growth-strategy", icon: "🚀", title: "Growth strategy", desc: "Find opportunities to grow and reach more people." },
];

const CATEGORIES = [
  { id: "health-fitness", icon: "❤️", label: "Health & Fitness" },
  { id: "saas", icon: "💻", label: "SaaS / Software" },
  { id: "ecommerce", icon: "🛒", label: "E-commerce" },
  { id: "education", icon: "🎓", label: "Education" },
  { id: "finance", icon: "💰", label: "Finance" },
  { id: "creator-tools", icon: "🎨", label: "Creator Tools" },
  { id: "consumer-apps", icon: "📱", label: "Consumer Apps" },
  { id: "other", icon: "···", label: "Other" },
];

const REGIONS = [
  { id: "us", flag: "🇺🇸", label: "United States" },
  { id: "uk", flag: "🇬🇧", label: "United Kingdom" },
  { id: "ca", flag: "🇨🇦", label: "Canada" },
  { id: "au", flag: "🇦🇺", label: "Australia" },
  { id: "in", flag: "🇮🇳", label: "India" },
  { id: "de", flag: "🇩🇪", label: "Germany" },
  { id: "fr", flag: "🇫🇷", label: "France" },
  { id: "other", flag: "🌐", label: "Other" },
];

const STEP_LABELS = ["Product", "Details", "Audience goals", "Generate map"];

/* ─── Sub-components ─────────────────────────────────────────────────── */

function TopBar({ step }: { step: number }) {
  const [, navigate] = useLocation();
  return (
    <div className="w-full flex items-center justify-between" style={{ padding: "24px clamp(24px,5vw,72px) 0" }}>
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to landing"
        className="flex items-center gap-3"
        style={{
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
          fontFamily: "inherit",
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
          style={{ width: 36, height: 36, objectFit: "contain" }}
          className="rounded-lg"
        />
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "#111827" }}>AudienceIQ</span>
      </button>
      <div className="flex flex-col items-end gap-1.5">
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Step {step} of 4</span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: 52,
                height: 4,
                borderRadius: 99,
                background: s <= step ? "#7C3AED" : "#E5E7EB",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BottomStepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0" style={{ padding: "20px 0 28px" }}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done || active ? "#7C3AED" : "#F3F4F6",
                  border: done || active ? "2px solid #7C3AED" : "2px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: done || active ? "#fff" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: 12,
                  transition: "all 0.3s",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "#7C3AED" : "#9CA3AF", marginTop: 4, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 40, height: 2, background: n < step ? "#7C3AED" : "#E5E7EB", marginBottom: 16, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled,
  nextLoading,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
}) {
  const disabled = nextDisabled || nextLoading;
  return (
    <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
      <div>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 500, color: "#6B7280",
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 16px", borderRadius: 8,
            }}
          >
            ← Back
          </button>
        )}
      </div>
      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          background: disabled ? "#C4B5FD" : "#7C3AED",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "13px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {nextLoading && (
          <span style={{
            width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
          }} />
        )}
        {nextLoading ? "Mapping your audience…" : nextLabel}
      </button>
    </div>
  );
}

/* ─── Step 1 ─────────────────────────────────────────────────────────── */
function Step1({ data, onChange, onNext }: {
  data: OnboardingState;
  onChange: (k: keyof OnboardingState, v: string) => void;
  onNext: () => void;
}) {
  const fields = [
    { key: "productIdea" as const, icon: "💬", label: "What is your product or idea?", helper: "In a few words, what does it do?", placeholder: "e.g. An AI calorie tracking app that logs food using photos" },
    { key: "targetUsers" as const, icon: "👥", label: "Who is it for?", helper: "Who are your ideal users?", placeholder: "e.g. Busy professionals who want to get healthier" },
    { key: "problem" as const, icon: "🎯", label: "What problem does it solve?", helper: "What's the main problem your product solves?", placeholder: "e.g. Manual tracking is hard and time consuming" },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Let's understand your product
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280" }}>
          Tell us a bit about what you're building so we can map the right audience.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{f.helper}</div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <textarea
                value={data[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                maxLength={200}
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: `1.5px solid ${data[f.key] ? "#7C3AED" : "#E5E7EB"}`,
                  outline: "none",
                  padding: "12px 14px 24px",
                  fontSize: 14,
                  color: "#111827",
                  resize: "none",
                  fontFamily: "inherit",
                  background: "#fff",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  boxShadow: data[f.key] ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = data[f.key] ? "#7C3AED" : "#E5E7EB"; e.target.style.boxShadow = data[f.key] ? "0 0 0 3px rgba(124,58,237,0.08)" : "none"; }}
              />
              <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, color: "#9CA3AF" }}>
                {data[f.key].length}/200
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 28 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Your data is private and secure</span>
        </div>
        <button
          onClick={onNext}
          disabled={!data.productIdea.trim()}
          style={{
            background: !data.productIdea.trim() ? "#C4B5FD" : "#7C3AED",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "13px 28px",
            fontSize: 15,
            fontWeight: 600,
            cursor: !data.productIdea.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 ─────────────────────────────────────────────────────────── */
function Step2({ data, onChange, onNext, onBack }: {
  data: OnboardingState;
  onChange: (k: keyof OnboardingState, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
          What best describes your goal?
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280" }}>
          This helps us tailor the insights that matter most.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {GOALS.map((g) => {
          const selected = data.goal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onChange("goal", g.id)}
              style={{
                position: "relative",
                background: selected ? "#F5F3FF" : "#fff",
                border: `1.5px solid ${selected ? "#7C3AED" : "#E5E7EB"}`,
                borderRadius: 12,
                padding: "20px 18px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                boxShadow: selected ? "0 0 0 3px rgba(124,58,237,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {selected && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</div>
              )}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: selected ? "#EDE9FE" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
                {g.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{g.desc}</div>
            </button>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.goal} />
    </div>
  );
}

/* ─── Step 3 ─────────────────────────────────────────────────────────── */
function Step3({ data, onChange, onNext, onBack }: {
  data: OnboardingState;
  onChange: (k: keyof OnboardingState, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isOther = data.category === "other";
  const canNext = data.category && (!isOther || data.customCategory.trim().length > 0);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Which category best fits your product?
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280" }}>
          This helps us benchmark against the right market.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {CATEGORIES.map((c) => {
          const selected = data.category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChange("category", c.id)}
              style={{
                position: "relative",
                background: selected ? "#F5F3FF" : "#fff",
                border: `1.5px solid ${selected ? "#7C3AED" : "#E5E7EB"}`,
                borderRadius: 12,
                padding: "18px 12px 14px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                boxShadow: selected ? "0 0 0 3px rgba(124,58,237,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {selected && (
                <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</div>
              )}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: selected ? "#EDE9FE" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.icon === "···" ? 12 : 18, margin: "0 auto 10px", fontWeight: c.icon === "···" ? 700 : 400, color: c.icon === "···" ? "#6B7280" : "inherit" }}>
                {c.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#111827", lineHeight: 1.3 }}>{c.label}</div>
            </button>
          );
        })}
      </div>

      {isOther && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            What category is it?
          </label>
          <input
            type="text"
            autoFocus
            value={data.customCategory}
            onChange={(e) => onChange("customCategory", e.target.value)}
            placeholder="e.g. Productivity, Travel, Gaming, Real estate"
            style={{
              width: "100%",
              borderRadius: 10,
              border: `1.5px solid ${data.customCategory ? "#7C3AED" : "#E5E7EB"}`,
              padding: "11px 14px",
              fontSize: 14,
              color: "#111827",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#fff",
              boxShadow: data.customCategory ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = data.customCategory ? "#7C3AED" : "#E5E7EB"; e.target.style.boxShadow = data.customCategory ? "0 0 0 3px rgba(124,58,237,0.08)" : "none"; }}
          />
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}

const LOADING_STEPS = [
  "Understanding your product…",
  "Finding likely audience segments…",
  "Mapping pain points and channels…",
  "Building your audience map…",
];

/* ─── Step 4 ─────────────────────────────────────────────────────────── */
function Step4({ data, onChange, onNext, onBack, generating, loadingStep }: {
  data: OnboardingState;
  onChange: (k: keyof OnboardingState, v: string) => void;
  onNext: () => void;
  onBack: () => void;
  generating?: boolean;
  loadingStep?: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = REGIONS.filter((r) =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Where are you planning to launch?
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280" }}>
          Select your primary market or region.
        </p>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search for a country or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            padding: "12px 44px 12px 16px",
            fontSize: 14,
            color: "#111827",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            background: "#fff",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 16 }}>🔍</span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Popular choices</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map((r) => {
          const selected = data.region === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onChange("region", r.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: selected ? "#F5F3FF" : "#fff",
                border: `1.5px solid ${selected ? "#7C3AED" : "#E5E7EB"}`,
                borderRadius: 10,
                padding: "12px 16px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: selected ? 600 : 400,
                color: "#111827",
                transition: "all 0.2s",
                boxShadow: selected ? "0 0 0 3px rgba(124,58,237,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <span style={{ fontSize: 20 }}>{r.flag}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{r.label}</span>
              {selected && <span style={{ color: "#7C3AED", fontWeight: 700, fontSize: 13 }}>✓</span>}
            </button>
          );
        })}
      </div>

      {data.region === "other" && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            What region are you targeting?
          </label>
          <input
            type="text"
            autoFocus
            value={data.customRegion}
            onChange={(e) => onChange("customRegion", e.target.value)}
            placeholder="e.g. Global, Southeast Asia, UAE, Latin America"
            style={{
              width: "100%",
              borderRadius: 10,
              border: `1.5px solid ${data.customRegion ? "#7C3AED" : "#E5E7EB"}`,
              padding: "11px 14px",
              fontSize: 14,
              color: "#111827",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#fff",
              boxShadow: data.customRegion ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = data.customRegion ? "#7C3AED" : "#E5E7EB"; e.target.style.boxShadow = data.customRegion ? "0 0 0 3px rgba(124,58,237,0.08)" : "none"; }}
          />
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Generate my audience map ✨"
        nextLoading={generating}
        nextDisabled={!data.region || (data.region === "other" && !data.customRegion.trim())}
      />
      {generating && (
        <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 12, transition: "opacity 0.3s" }}>
          {loadingStep ?? LOADING_STEPS[0]}
        </p>
      )}
    </div>
  );
}

/* ─── Main Onboarding Page ───────────────────────────────────────────── */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingState>({
    productIdea: "",
    targetUsers: "",
    problem: "",
    goal: "",
    category: "",
    customCategory: "",
    region: "",
    customRegion: "",
  });

  const onChange = (key: keyof OnboardingState, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0]);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (generating) {
      let idx = 0;
      setLoadingStep(LOADING_STEPS[0]);
      stepIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % LOADING_STEPS.length;
        setLoadingStep(LOADING_STEPS[idx]);
      }, 2_200);
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      setLoadingStep(LOADING_STEPS[0]);
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [generating]);

  const handleGenerate = async () => {
    if (generating) return;
    const finalCategory = data.category === "other" ? data.customCategory.trim() : data.category;
    const finalRegion   = data.region   === "other" ? data.customRegion.trim()   : data.region;
    const onboardingData = { ...data, finalCategory, finalRegion };

    /* Compat-key cleanup + onboarding write happens inside
       createFreshResearchSession() once we have the generated map. */

    setGenerating(true);

    const TIMEOUT_MS = 20_000;

    try {
      /* Guests get exactly *one* local research session. If we positively
         confirm the user is signed out, wipe the entire local session
         store before creating the new one so this research replaces (not
         appends to) any prior guest research. Signed-in users still
         accumulate full history in Supabase.
         This lives inside the outer try/finally so a thrown auth read
         can't strand `generating=true`. On an *unknown* auth state we
         default to the non-destructive path (skip clearing) so we never
         wipe a signed-in user's local cache by mistake — only an
         explicit `null` from getCurrentUser() triggers the wipe. */
      let isConfirmedGuest = false;
      try {
        const u = await getCurrentUser();
        isConfirmedGuest = u === null;
      } catch { /* leave local data intact on unknown auth state */ }
      if (isConfirmedGuest) clearGuestSessionStore();

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let map: unknown = null;
      try {
        const res = await fetch("/api/audience/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            productIdea:   onboardingData.productIdea,
            targetUsers:   onboardingData.targetUsers,
            problem:       onboardingData.problem,
            goal:          onboardingData.goal,
            finalCategory: onboardingData.finalCategory,
            finalRegion:   onboardingData.finalRegion,
          }),
        });
        clearTimeout(timer);
        if (res.ok) map = await res.json();
      } catch {
        clearTimeout(timer);
      }

      const finalMap = map
        ? (map as Parameters<typeof saveAudienceMap>[0])
        : generateMockAudienceMap(onboardingData);

      /* Centralised fresh-session creation: clears stale compat keys,
         allocates a new id, persists the session, points active id at it,
         and re-syncs compat keys to this session's data. */
      const session1 = createFreshResearchSession({
        onboardingData,
        audienceMap: finalMap,
      });
      setHasGuestResearch();
      sbSaveSession(session1).catch(() => {});
    } catch {
      const fallback = generateMockAudienceMap(onboardingData);
      const session2 = createFreshResearchSession({
        onboardingData,
        audienceMap: fallback,
      });
      setHasGuestResearch();
      sbSaveSession(session2).catch(() => {});
    } finally {
      setGenerating(false);
    }

    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F5F3FF 0%, #fff 50%, #fafafe 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bottom-left lavender dotted pattern */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 340,
          height: 340,
          backgroundImage: "radial-gradient(circle, #C4B5FD 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 80% 80% at 0% 100%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 0% 100%, black 20%, transparent 70%)",
          opacity: 0.45,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <TopBar step={step} />

      {/* Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px clamp(16px,5vw,72px)", position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: "100%",
            maxWidth: step === 1 ? 760 : step === 3 ? 820 : 720,
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
            padding: "40px 48px",
            transition: "max-width 0.3s",
          }}
        >
          {step === 1 && <Step1 data={data} onChange={onChange} onNext={nextStep} />}
          {step === 2 && <Step2 data={data} onChange={onChange} onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <Step3 data={data} onChange={onChange} onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <Step4 data={data} onChange={onChange} onNext={handleGenerate} onBack={prevStep} generating={generating} loadingStep={loadingStep} />}
        </div>
      </div>

      {/* Bottom stepper */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <BottomStepper step={step} />
      </div>
    </div>
  );
}
