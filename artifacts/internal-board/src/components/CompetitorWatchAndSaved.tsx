import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Bookmark } from "lucide-react";

const competitors = [
  { name: "MyFitnessPal", mentions: "18.2k", sentiment: "Negative", complaint: "Paywalled scanner" },
  { name: "Cronometer", mentions: "6.4k", sentiment: "Neutral", complaint: "Clunky UI" },
  { name: "Lose It!", mentions: "5.1k", sentiment: "Positive", complaint: "Ads too aggressive" },
  { name: "Yazio", mentions: "3.2k", sentiment: "Neutral", complaint: "Recipe database weak" },
  { name: "FatSecret", mentions: "1.8k", sentiment: "Neutral", complaint: "Outdated design" },
];

const insights = [
  "Users will switch apps immediately if barcode scanning is paywalled.",
  "AI food estimation is viewed as a gimmick, not a core feature yet.",
  "European users heavily prefer Yazio, indicating a localized marketing gap.",
];

export function CompetitorWatchAndSaved() {
  return (
    <div className="flex flex-col gap-4 h-full col-span-1 md:col-span-2 lg:col-span-1">
      {/* Competitor Watch */}
      <Card className="shadow-sm border-border flex-1">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            Competitor Watch
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/50">
            {competitors.map((comp, i) => (
              <li key={i} className="p-3 hover:bg-secondary/20 transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{comp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">{comp.mentions}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      comp.sentiment === 'Positive' ? 'bg-emerald-500' : 
                      comp.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`} title={comp.sentiment} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium mr-1">Top issue:</span> 
                  {comp.complaint}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Saved Insights */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-3 border-none">
          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5" />
            Saved Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
           {insights.map((insight, i) => (
             <div key={i} className="text-xs text-foreground leading-snug pl-2 border-l-2 border-primary/40 py-0.5">
               {insight}
             </div>
           ))}
        </CardContent>
      </Card>
    </div>
  );
}
