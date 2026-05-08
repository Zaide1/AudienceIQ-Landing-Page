import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, Linkedin } from "lucide-react";
import { SiReddit } from "react-icons/si";

const opportunities = [
  {
    id: 1,
    angle: "People don't want accurate calorie tracking — they want frictionless logging.",
    potential: "Very High Potential",
    type: "CONTRARIAN",
  },
  {
    id: 2,
    angle: "MyFitnessPal's barcode scanner being paywalled is the single biggest churn driver in fitness tech right now.",
    potential: "High Potential",
    type: "OBSERVATION",
  },
  {
    id: 3,
    angle: "We're moving from 'tracking macros' to 'AI estimating portions from a photo'. The gap is still trust.",
    potential: "Medium Potential",
    type: "TREND",
  }
];

export function ViralPostOpportunities() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col bg-[#faf5ff]/40">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-primary">
          Viral Post Opportunities
        </CardTitle>
        <a href="#" className="text-xs text-primary font-medium hover:underline">View all</a>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-border/40">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 hover:bg-white/60 transition-colors flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{opp.type}</span>
                <Badge variant="secondary" className="text-[10px] font-medium bg-[#f3e8ff] text-primary hover:bg-[#f3e8ff]/80 border-none px-2 py-0.5 rounded-full">
                  {opp.potential}
                </Badge>
              </div>
              <p className="text-[13px] font-medium text-foreground leading-snug">"{opp.angle}"</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] font-medium text-muted-foreground">Engagement Potential</span>
                <div className="flex gap-2 text-muted-foreground">
                  <Twitter className="w-3.5 h-3.5" />
                  <Linkedin className="w-3.5 h-3.5" />
                  <SiReddit className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
