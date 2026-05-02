import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Soft radial gradient top-right */}
      <div
        className="fixed top-0 right-0 pointer-events-none -z-10"
        style={{
          width: 900,
          height: 900,
          background: "radial-gradient(ellipse at top right, rgba(124,58,237,0.07) 0%, transparent 65%)",
        }}
      />
      <Navbar />
      <main className="flex-1 flex items-center">
        <Hero />
      </main>
    </div>
  );
}
