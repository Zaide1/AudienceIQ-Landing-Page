import { Button } from "@/components/ui/button";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

export function Navbar() {
  return (
    <header
      className="w-full flex items-center justify-between bg-white/96 backdrop-blur-sm z-20 sticky top-0 border-b border-border/30"
      style={{
        height: 80,
        paddingLeft: "clamp(24px, 5vw, 72px)",
        paddingRight: "clamp(24px, 5vw, 72px)",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src={logoImg}
          alt="Audense Logo"
          style={{ width: 48, height: 48, objectFit: "contain" }}
          className="rounded-lg"
        />
        <span
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: 26, letterSpacing: "-0.02em" }}
        >
          Audense
        </span>
      </div>

      <Button
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ width: 210, height: 52, fontSize: 16 }}
        data-testid="button-map-audience-nav"
      >
        Map my audience →
      </Button>
    </header>
  );
}
