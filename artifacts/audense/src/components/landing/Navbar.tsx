import { Button } from "@/components/ui/button";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";
import { useLocation } from "wouter";

export function Navbar() {
  const [, navigate] = useLocation();
  return (
    <header
      className="w-full flex items-center justify-between bg-white/96 backdrop-blur-sm z-20 sticky top-0 border-b border-border/30"
      style={{
        height: 80,
        paddingLeft: "clamp(24px, 5vw, 72px)",
        paddingRight: "clamp(24px, 5vw, 72px)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src={logoImg}
          alt="AudienceIQ Logo"
          width={48}
          height={48}
          decoding="sync"
          loading="eager"
          fetchPriority="high"
          style={{ width: 40, height: 40, objectFit: "contain" }}
          className="rounded-lg sm:!w-12 sm:!h-12 flex-shrink-0"
        />
        <span
          className="font-bold tracking-tight text-foreground text-lg sm:text-[26px] truncate"
          style={{ letterSpacing: "-0.02em" }}
        >
          AudienceIQ
        </span>
      </div>

      <Button
        onClick={() => navigate("/onboarding")}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0"
        style={{ height: 44, fontSize: 14, borderRadius: 14, paddingLeft: 16, paddingRight: 16 }}
        data-testid="button-map-audience-nav"
      >
        <span className="hidden sm:inline">Map my audience →</span>
        <span className="sm:hidden">Start →</span>
      </Button>
    </header>
  );
}
