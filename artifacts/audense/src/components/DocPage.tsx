import { ReactNode } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

type DocPageProps = {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  backLabel?: string;
  backTo?: string;
  children: ReactNode;
};

export function DocPage({
  title,
  subtitle,
  lastUpdated,
  backLabel = "Back",
  backTo,
  children,
}: DocPageProps) {
  const [, navigate] = useLocation();

  const goBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        boxSizing: "border-box",
        color: "#111827",
      }}
    >
      {/* ── Hero with soft lavender gradient ──────────────────────────── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          background:
            "linear-gradient(180deg, #F5F1FB 0%, #F8F5FC 55%, #FFFFFF 100%)",
          padding: "clamp(40px, 6vw, 72px) clamp(20px, 5vw, 64px) clamp(56px, 7vw, 96px)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <button
            onClick={goBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: "4px 0",
              fontSize: 14,
              fontWeight: 500,
              color: "#6B7280",
              cursor: "pointer",
              marginBottom: 32,
              fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>

          <h1
            style={{
              fontSize: "clamp(40px, 5.5vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#0D0D12",
              margin: 0,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              marginTop: 18,
              fontSize: "clamp(16px, 1.2vw, 19px)",
              lineHeight: 1.55,
              color: "#6B7280",
              margin: "18px 0 0",
              maxWidth: 640,
            }}
          >
            {subtitle}
          </p>

          {lastUpdated && (
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                color: "#9CA3AF",
                margin: "14px 0 0",
              }}
            >
              Last updated {lastUpdated}
            </p>
          )}
        </div>
      </section>

      {/* ── Long-form content ─────────────────────────────────────────── */}
      <main
        style={{
          padding: "clamp(24px, 4vw, 56px) clamp(20px, 5vw, 64px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}

export function DocSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section style={{ paddingTop: 36, paddingBottom: 4 }}>
      <h2
        style={{
          fontSize: "clamp(22px, 1.8vw, 26px)",
          fontWeight: 800,
          letterSpacing: "-0.015em",
          color: "#0D0D12",
          margin: "0 0 14px",
        }}
      >
        {heading}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </section>
  );
}

export function DocParagraph({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16,
        lineHeight: 1.75,
        color: "#374151",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export function DocBulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#7C3AED",
              flexShrink: 0,
              marginTop: 11,
            }}
          />
          <span style={{ fontSize: 16, lineHeight: 1.7, color: "#374151" }}>
            {it}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DocDefinition({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        paddingTop: 14,
        paddingBottom: 14,
        borderTop: "1px solid #F1EEF8",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#7C3AED",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.7, color: "#374151" }}>
        {body}
      </div>
    </div>
  );
}
