import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function Hero() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-center z-10 flex-1">
      {/* Left Column */}
      <div className="flex flex-col items-start gap-8 max-w-xl">
        <h1 className="text-6xl sm:text-7xl lg:text-[84px] font-extrabold tracking-tight text-foreground leading-[1.05]">
          Your audience,<br />
          <span className="text-primary">found.</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed pr-4">
          Audense maps who wants your product, where they are, and what they need to hear.
        </p>

        <div className="flex flex-col gap-5 w-full sm:w-auto mt-2">
          <Button 
            size="lg"
            className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-semibold px-10 h-16 shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
            data-testid="button-map-audience-hero"
          >
            Map my audience &rarr;
          </Button>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-30">AJ</div>
              <div className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-20">MS</div>
              <div className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10">TK</div>
            </div>
            <span className="text-base font-medium text-muted-foreground">
              Join <span className="font-bold text-primary">1,200+</span> founders
            </span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="relative w-full flex items-center justify-center lg:justify-end lg:pr-4 perspective-[2000px]">
        {/* Decorative elements behind dashboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-[100px] -z-10" />
        <DashboardPreview />
      </div>
    </section>
  );
}
