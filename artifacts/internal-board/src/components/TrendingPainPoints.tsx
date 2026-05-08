import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const painPoints = [
  { rank: 1, text: "Barcode scanner not finding new products", mentions: "1,204", growth: "+45%", intensity: "High" },
  { rank: 2, text: "Too many taps to log a single meal", mentions: "982", growth: "+12%", intensity: "High" },
  { rank: 3, text: "Premium features paywalled (recipes)", mentions: "840", growth: "+8%", intensity: "Medium" },
  { rank: 4, text: "Apple Health sync failing silently", mentions: "655", growth: "+21%", intensity: "High" },
  { rank: 5, text: "Serving sizes confusing/inconsistent", mentions: "430", growth: "-2%", intensity: "Medium" },
];

export function TrendingPainPoints() {
  return (
    <Card className="shadow-sm border-border h-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Trending Pain Points
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/50">
          {painPoints.map((point) => (
            <li key={point.rank} className="p-3 sm:p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4 text-right pt-0.5">{point.rank}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{point.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      {point.mentions} <span className="opacity-70">mnts</span>
                    </span>
                    <span className="flex items-center text-emerald-600 font-medium">
                      {point.growth}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] uppercase px-1.5 py-0 h-5 font-semibold ${
                    point.intensity === 'High' 
                      ? 'border-destructive/30 text-destructive bg-destructive/5' 
                      : 'border-amber-500/30 text-amber-600 bg-amber-500/5'
                  }`}
                >
                  {point.intensity}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
