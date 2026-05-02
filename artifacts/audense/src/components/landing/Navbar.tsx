import { Button } from "@/components/ui/button";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

export function Navbar() {
  return (
    <header className="w-full px-8 lg:px-16 py-4 flex items-center justify-between bg-white/95 backdrop-blur-sm z-20 sticky top-0 border-b border-border/40" style={{ height: 72 }}>
      <div className="flex items-center gap-2.5">
        <img
          src={logoImg}
          alt="Audense Logo"
          style={{ width: 28, height: 28, objectFit: "contain" }}
          className="rounded-lg"
        />
        <span className="font-bold text-[20px] tracking-tight text-foreground">Audense</span>
      </div>

      <Button
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
        data-testid="button-map-audience-nav"
      >
        Map my audience →
      </Button>
    </header>
  );
}
