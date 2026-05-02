import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function Hero() {
  return (
    <section
      style={{
        width: "100%",
        minHeight: "calc(100vh - 88px)",
        display: "grid",
        gridTemplateColumns: "minmax(420px, 0.40fr) minmax(680px, 0.60fr)",
        gap: "clamp(32px, 4vw, 64px)",
        alignItems: "center",
        paddingLeft: "clamp(32px, 5vw, 72px)",
        paddingRight: "clamp(32px, 4vw, 56px)",
        paddingTop: 40,
        paddingBottom: 40,
        boxSizing: "border-box",
      }}
    >
      {/* ── Left column ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <h1
          style={{
            fontSize: "clamp(72px, 5.4vw, 104px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "#0D0D12",
            maxWidth: 560,
            margin: 0,
          }}
        >
          Your audience,
          <br />
          <span style={{ color: "#7C3AED" }}>found.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(20px, 1.6vw, 28px)",
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
            style={{
              width: 420,
              height: 76,
              fontSize: 26,
              fontWeight: 700,
              borderRadius: 16,
              background: "#7C3AED",
              color: "#fff",
              boxShadow: "0 8px 30px rgba(124,58,237,0.35)",
              letterSpacing: "-0.01em",
            }}
            className="transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
          >
            Map my audience →
          </Button>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 4 }}>
            <div style={{ display: "flex" }}>
              {[
                { init: "AJ", a: "#9333ea", b: "#6366f1" },
                { init: "MS", a: "#ec4899", b: "#f43f5e" },
                { init: "TK", a: "#3b82f6", b: "#06b6d4" },
              ].map(({ init, a, b }, i) => (
                <div
                  key={init}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2.5px solid #fff",
                    background: `linear-gradient(135deg, ${a}, ${b})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
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
            <span style={{ fontSize: 17, fontWeight: 500, color: "#6B7280" }}>
              Join{" "}
              <span style={{ fontWeight: 700, color: "#7C3AED" }}>1,200+</span>{" "}
              founders
            </span>
          </div>
        </div>
      </div>

      {/* ── Right column — dashboard mockup ───────────────────────────── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        {/* Purple glow behind mockup */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "75%",
            height: "65%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
