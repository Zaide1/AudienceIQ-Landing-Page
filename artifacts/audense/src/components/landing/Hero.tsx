import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function Hero() {
  return (
    <section
      className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 py-10 lg:py-16 flex flex-col lg:flex-row gap-10 lg:gap-0 items-center"
      style={{ minHeight: "calc(100vh - 72px)" }}
    >
      {/* Left column — 42% */}
      <div className="flex flex-col items-start gap-8 w-full lg:w-[42%] shrink-0 lg:pr-12">
        <h1
          className="font-extrabold tracking-tight text-foreground leading-[0.98]"
          style={{ fontSize: "clamp(56px, 5.5vw, 84px)", maxWidth: 560 }}
        >
          Your audience,
          <br />
          <span className="text-primary">found.</span>
        </h1>

        <p
          className="text-muted-foreground leading-relaxed"
          style={{ fontSize: "clamp(18px, 1.6vw, 24px)", maxWidth: 480 }}
        >
          Audense maps who wants your product, where they are, and what they
          need to hear.
        </p>

        <div className="flex flex-col gap-5 mt-2">
          <Button
            data-testid="button-map-audience-hero"
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
            style={{ fontSize: 18, height: 64, width: 280 }}
          >
            Map my audience →
          </Button>

          <div className="flex items-center gap-3 pl-1">
            <div className="flex -space-x-3">
              {[
                { init: "AJ", from: "from-purple-400", to: "to-indigo-500", z: "z-30" },
                { init: "MS", from: "from-pink-400",   to: "to-rose-500",   z: "z-20" },
                { init: "TK", from: "from-blue-400",   to: "to-cyan-500",   z: "z-10" },
              ].map(({ init, from, to, z }) => (
                <div
                  key={init}
                  className={`w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br ${from} ${to} flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${z}`}
                >
                  {init}
                </div>
              ))}
            </div>
            <span className="text-base font-medium text-muted-foreground">
              Join <span className="font-bold text-primary">1,200+</span> founders
            </span>
          </div>
        </div>
      </div>

      {/* Right column — 58% */}
      <div className="relative w-full lg:w-[58%] flex items-center justify-center">
        {/* Purple glow behind mockup */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[70%] h-[60%] bg-primary/10 rounded-full blur-[100px]" />
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}
