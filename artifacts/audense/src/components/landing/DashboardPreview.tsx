import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Focus, Target, CheckCircle2, 
  Send, Sparkles, Plus
} from "lucide-react";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

function DotGrid() {
  const dots = [];
  for (let i = 0; i < 400; i++) {
    // Generate cluster-like distribution
    let colorClass = "bg-muted";
    
    // Bottom-left cluster (purple)
    if (i % 20 < 8 && Math.floor(i / 20) > 12) {
      if (Math.random() > 0.3) colorClass = "bg-primary";
    } 
    // Yellow cluster
    else if (i % 20 > 10 && i % 20 < 15 && Math.floor(i / 20) > 10 && Math.floor(i / 20) < 15) {
      if (Math.random() > 0.4) colorClass = "bg-yellow-400";
    }
    // Green cluster
    else if (i % 20 > 4 && i % 20 < 10 && Math.floor(i / 20) > 4 && Math.floor(i / 20) < 9) {
      if (Math.random() > 0.4) colorClass = "bg-emerald-400";
    }
    // Orange cluster
    else if (i % 20 > 14 && Math.floor(i / 20) < 6) {
      if (Math.random() > 0.4) colorClass = "bg-orange-400";
    }

    dots.push(
      <div 
        key={i} 
        className={`w-[5px] h-[5px] rounded-full ${colorClass} transition-all duration-300 hover:scale-150 hover:bg-primary cursor-pointer`}
      />
    );
  }

  return (
    <div className="relative p-6 bg-white border border-border/60 rounded-xl w-full h-[220px] flex items-center justify-center overflow-hidden shadow-sm">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[7px]">
        {dots}
      </div>
      
      {/* Tooltip callout */}
      <div className="absolute top-6 left-10 bg-white border shadow-lg rounded-xl p-3 text-xs z-10 min-w-[180px] animate-in fade-in slide-in-from-bottom-2">
        <div className="font-bold text-foreground mb-0.5 text-[13px]">Gym Goers</div>
        <div className="text-muted-foreground mb-1 text-[11px] font-medium">25% of audience</div>
        <div className="font-semibold text-primary text-[13px]">~210K – 350K people</div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-white/90 backdrop-blur-sm border shadow-sm rounded-full px-3 py-1.5 text-[10px] font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-foreground">Covered 7%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span className="text-muted-foreground">Untapped 93%</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <Card className="w-full max-w-[940px] h-[740px] rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden flex flex-col bg-background border-border/50 -rotate-1 transition-all duration-700 hover:rotate-0 hover:-translate-y-2 hover:shadow-primary/20">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 justify-between bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="Logo" className="w-5 h-5 rounded" />
          <span className="font-bold text-sm tracking-tight">Audense</span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Chat Interface */}
        <div className="w-[340px] border-r flex flex-col bg-[#F9FAFB] shrink-0">
          <div className="px-4 py-3 border-b bg-white flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">Audense AI</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-none">
            {/* AI Msg */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-white border shadow-sm text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tl-sm text-foreground">
                Hi Zaide 👋 I'm Audense, your audience intelligence agent. I'll help you discover who your ideal users are, how big your market is, and what matters to them. Let's start with your product.
              </div>
            </div>

            {/* User Msg */}
            <div className="flex items-start gap-2.5 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary mt-0.5">Z</div>
              <div className="bg-[#F5F3FF] text-[#4C1D95] font-medium border border-primary/10 text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tr-sm">
                I'm building an AI calorie tracking app that automatically logs food using photo recognition. It's for people who want to lose weight but hate manual tracking.
              </div>
            </div>

            {/* AI Msg */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-white border shadow-sm text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tl-sm text-foreground">
                Got it. Who do you think your primary users are?
              </div>
            </div>

            {/* User Msg */}
            <div className="flex items-start gap-2.5 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary mt-0.5">Z</div>
              <div className="bg-[#F5F3FF] text-[#4C1D95] font-medium border border-primary/10 text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tr-sm">
                Busy professionals, 20-35, who go to the gym and care about fitness but don't have time to track everything.
              </div>
            </div>

             {/* AI Msg */}
             <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-white border shadow-sm text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tl-sm text-foreground">
                Perfect. Are you targeting any specific country or region first?
              </div>
            </div>

            {/* User Msg */}
            <div className="flex items-start gap-2.5 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary mt-0.5">Z</div>
              <div className="bg-[#F5F3FF] text-[#4C1D95] font-medium border border-primary/10 text-[13px] leading-relaxed p-3.5 rounded-2xl rounded-tr-sm">
                Let's start with the UK.
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t mt-auto">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Ask anything about your audience..." 
                className="w-full bg-[#F3F4F6] border-none rounded-full pl-4 pr-10 py-3 text-[13px] focus:outline-none placeholder:text-muted-foreground/70"
                readOnly
              />
              <button className="absolute right-1.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-sm">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-3 font-medium">
              Audense can make mistakes. Verify important insights.
            </div>
          </div>
        </div>

        {/* Right Panel: Audience Data */}
        <div className="flex-1 bg-[#FAFAFA] flex flex-col overflow-y-auto">
          <div className="px-8 py-5 border-b bg-white sticky top-0 z-10 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-[22px] font-bold text-foreground tracking-tight">Your Audience</h2>
              <p className="text-[13px] font-medium text-muted-foreground mt-0.5">Market insights for AI Calorie Tracker in UK</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Export Data
            </Button>
          </div>

          <div className="p-8 flex flex-col gap-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 border border-border/60 shadow-sm bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Reachable</span>
                </div>
                <div className="font-extrabold text-lg text-foreground tracking-tight">850K–1.4M</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-1">people in the UK</div>
              </Card>
              <Card className="p-4 border border-primary/20 shadow-sm bg-white rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Focus className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Coverage</span>
                </div>
                <div className="font-extrabold text-lg text-primary tracking-tight">7%</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-1">~60K people</div>
              </Card>
              <Card className="p-4 border border-border/60 shadow-sm bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-[#F59E0B]">
                  <Target className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Untapped</span>
                </div>
                <div className="font-extrabold text-lg text-foreground tracking-tight">93%</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-1">~790K–1.34M</div>
              </Card>
              <Card className="p-4 border border-border/60 shadow-sm bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Confidence</span>
                </div>
                <div className="font-extrabold text-lg text-[#10B981] tracking-tight">Medium</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-1">Based on available data</div>
              </Card>
            </div>

            {/* Audience Universe Dot Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground tracking-tight">Audience Universe</h3>
              <DotGrid />
            </div>

            {/* Segments */}
            <div className="space-y-4 pb-8">
              <h3 className="text-base font-bold text-foreground tracking-tight">Top Audience Segments</h3>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Gym Goers", size: "25%", range: "~210K-350K", platforms: ["Instagram", "TikTok", "YouTube"] },
                  { name: "Busy Professionals", size: "30%", range: "~255K-420K", platforms: ["LinkedIn", "X/Twitter"] },
                  { name: "Health Conscious", size: "20%", range: "~170K-280K", platforms: ["Instagram", "Facebook"] },
                  { name: "Weight Loss Beginners", size: "15%", range: "~125K-210K", platforms: ["TikTok", "Reddit"] },
                  { name: "Nutrition Optimisers", size: "10%", range: "~85K-140K", platforms: ["YouTube", "Reddit", "X/Twitter"] },
                ].map((segment, i) => (
                  <Card key={i} className="p-4 border border-border/60 shadow-sm bg-white rounded-xl flex items-center justify-between hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors">{segment.name}</span>
                        <Badge variant="secondary" className="text-[11px] font-bold h-5 rounded px-1.5 bg-primary/10 text-primary hover:bg-primary/20">{segment.size}</Badge>
                      </div>
                      <div className="text-[13px] font-medium text-muted-foreground">{segment.range} people</div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Top Platforms</div>
                      <div className="flex items-center gap-1.5">
                        {segment.platforms.map(p => (
                          <div key={p} className="h-6 px-2 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-foreground/70">
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
