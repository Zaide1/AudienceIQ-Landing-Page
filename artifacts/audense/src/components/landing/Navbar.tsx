import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

export function Navbar() {
  return (
    <header className="w-full px-6 py-5 flex items-center justify-between bg-white z-10 sticky top-0">
      <Link href="/" className="flex items-center gap-2.5 group">
        <img src={logoImg} alt="Audense Logo" className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform" />
        <span className="font-bold text-[22px] tracking-tight text-foreground">Audense</span>
      </Link>
      
      <Button 
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2.5 h-auto shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
        data-testid="button-map-audience-nav"
      >
        Map my audience &rarr;
      </Button>
    </header>
  );
}
