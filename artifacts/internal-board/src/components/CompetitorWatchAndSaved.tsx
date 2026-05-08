import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { Link } from "wouter";

const competitors = [
  { name: "MyFitnessPal", mentions: "8.2k mentions", sentiment: "Negative", complaint: "Paywalled scanner" },
  { name: "Cronometer", mentions: "4.1k mentions", sentiment: "Neutral", complaint: "Clunky UI" },
  { name: "Lose It!", mentions: "3.8k mentions", sentiment: "Positive", complaint: "Ads too aggressive" },
  { name: "Yazio", mentions: "2.4k mentions", sentiment: "Neutral", complaint: "Recipe database weak" },
  { name: "FatSecret", mentions: "1.2k mentions", sentiment: "Neutral", complaint: "Outdated design" },
];

const insights = [
  { title: "Users will switch apps immediately if barcode scanning is paywalled.", time: "2 hours ago" },
  { title: "AI food estimation is viewed as a gimmick, not a core feature yet.", time: "5 hours ago" },
  { title: "European users heavily prefer Yazio, indicating a localized marketing gap.", time: "1 day ago" }
];

export function CompetitorWatchAndSaved() {
  return (
    <div className="flex flex-col gap-6 h-full col-span-1 md:col-span-2 lg:col-span-1">
      {/* Competitor Watch */}
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px] flex-1 flex flex-col">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Competitor Watch</CardTitle>
          <Link href="/competitor-watch" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ul className="divide-y divide-border/40">
            {competitors.map((comp, i) => (
              <li key={i} className="px-5 py-3 hover:bg-secondary/20 transition-colors flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-foreground">{comp.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground font-medium">{comp.mentions}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] uppercase px-1.5 py-0 h-4 font-bold border-none ${
                        comp.sentiment === 'Positive' ? 'text-[#059669] bg-[#D1FAE5]' : 
                        comp.sentiment === 'Negative' ? 'text-[#B91C1C] bg-[#FEE2E2]' : 
                        'text-[#B45309] bg-[#FEF3C7]'
                      }`}
                    >
                      {comp.sentiment}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic truncate">
                  Top complaint: {comp.complaint}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Saved Insights */}
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px] flex flex-col">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            Saved Insights
          </CardTitle>
          <Link href="/saved" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
           {insights.map((insight, i) => (
             <div key={i} className="p-4 hover:bg-secondary/20 transition-colors flex justify-between items-start gap-4">
               <div className="flex flex-col gap-1">
                 <p className="text-[13px] font-medium text-foreground leading-snug">{insight.title}</p>
                 <span className="text-[10px] text-muted-foreground font-medium">{insight.time}</span>
               </div>
               <button className="text-muted-foreground hover:text-primary transition-colors mt-0.5">
                 <Bookmark className="w-4 h-4" />
               </button>
             </div>
           ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
