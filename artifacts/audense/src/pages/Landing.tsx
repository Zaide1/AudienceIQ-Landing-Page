import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle background gradient overlay matching reference */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4" />
        <Hero />
      </main>
    </div>
  );
}
