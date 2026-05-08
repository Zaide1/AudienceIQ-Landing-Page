import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share, ArrowRightCircle } from "lucide-react";

const opportunities = [
  {
    id: 1,
    angle: "People don't want accurate calorie tracking — they want frictionless logging.",
    potential: "High",
    type: "Contrarian",
  },
  {
    id: 2,
    angle: "MyFitnessPal's barcode scanner being paywalled is the single biggest churn driver in fitness tech right now.",
    potential: "Very High",
    type: "Observation",
  },
  {
    id: 3,
    angle: "We're moving from 'tracking macros' to 'AI estimating portions from a photo'. The gap is still trust.",
    potential: "Medium",
    type: "Trend",
  }
];

export function ViralPostOpportunities() {
  return (
    <Card className="shadow-sm border-border h-full bg-[#faf5ff]/40">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <ArrowRightCircle className="w-4 h-4" />
          Viral Post Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 hover:bg-white/60 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 h-4 bg-white">
                  {opp.type}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20">
                  {opp.potential} Potential
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug mb-3">"{opp.angle}"</p>
              <div className="flex justify-end gap-2">
                <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary transition-colors">
                  <Share className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
