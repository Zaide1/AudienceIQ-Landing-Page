import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { BelowHero } from "@/components/landing/BelowHero";

export default function Landing() {
  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden"
      style={{ background: "#ffffff" }}
    >
      {/*
        ── Background layers (pointer-events: none, z-index: 0) ──────────
        1. Bottom-left lavender radial wash
        2. Bottom-left repeating dot halftone
        3. Top-right purple glow (behind mockup)
      */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: [
            /* bottom-left lavender wash */
            "radial-gradient(ellipse 55% 55% at 0% 100%, rgba(167,139,250,0.13) 0%, transparent 70%)",
            /* top-right purple glow */
            "radial-gradient(ellipse 55% 70% at 100% 30%, rgba(124,58,237,0.07) 0%, transparent 65%)",
          ].join(", "),
        }}
      />

      {/* Bottom-left dot halftone pattern */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 480,
          height: 480,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.45,
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.28) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 90% 90% at 0% 100%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 0% 100%, black 0%, transparent 75%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
            <Hero />
          </div>
          <BelowHero />
        </main>
      </div>
    </div>
  );
}
