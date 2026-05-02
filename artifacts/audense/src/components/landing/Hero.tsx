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

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 2 }}>
            <div style={{ display: "flex" }}>
              {[
                { init: "AJ", a: "#9333ea", b: "#6366f1" },
                { init: "MS", a: "#ec4899", b: "#f43f5e" },
                { init: "TK", a: "#3b82f6", b: "#06b6d4" },
              ].map(({ init, a, b }, i) => (
                <div
                  key={init}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "2.5px solid #fff",
                    background: `linear-gradient(135deg, ${a}, ${b})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    marginLeft: i === 0 ? 0 : -12,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    zIndex: 3 - i,
                    position: "relative",
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#6B7280" }}>
              Join{" "}
              <span style={{ fontWeight: 700, color: "#7C3AED" }}>1,200+</span>{" "}
              founders
            </span>
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
            width: "95%",
            height: "85%",
            background: "radial-gradient(ellipse, rgba(167,139,250,0.20) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
            filter: "blur(60px)",
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
