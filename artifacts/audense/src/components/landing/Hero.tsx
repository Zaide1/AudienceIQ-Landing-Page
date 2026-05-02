import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { useLocation } from "wouter";

export function Hero() {
  const [, navigate] = useLocation();
  return (
    <section className="hero-grid">
      {/* ── Left column ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <h1
          style={{
            fontSize: "clamp(56px, 5vw, 88px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "#0D0D12",
            maxWidth: 560,
            margin: 0,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>Your audience,</span>
          <br />
          <span style={{ color: "#7C3AED" }}>found.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(20px, 1.5vw, 26px)",
            lineHeight: 1.55,
            color: "#6B7280",
            maxWidth: 520,
            margin: 0,
          }}
        >
          Audense maps who wants your product, where they are, and what they
          need to hear.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Button
            data-testid="button-map-audience-hero"
            onClick={() => navigate("/onboarding")}
            style={{
              width: 340,
              height: 64,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 14,
              background: "#7C3AED",
              color: "#fff",
              boxShadow: "0 8px 28px rgba(124,58,237,0.30)",
              letterSpacing: "-0.01em",
            }}
            className="transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
          >
            Map my audience →
          </Button>

          {/* Value chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              paddingLeft: 2,
              maxWidth: 520,
            }}
          >
            {[
              "Validate the idea",
              "Find your first audience",
              "Plan where to reach them",
            ].map((label) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#F5F3FF",
                  border: "1px solid #E9E3FB",
                  color: "#6D28D9",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right column — dashboard mockup ─────────────────────────── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
        {/* Lavender glow — outside the perspective wrapper so it isn't skewed */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            height: "75%",
            background: "radial-gradient(ellipse, rgba(167,139,250,0.18) 0%, rgba(124,58,237,0.05) 40%, transparent 65%)",
            filter: "blur(70px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* Subtle 2D tilt — matches reference, just slightly off vertical */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            transform: "rotate(0.8deg)",
            transformOrigin: "center center",
          }}
        >
          <div className="mockup-outer">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
