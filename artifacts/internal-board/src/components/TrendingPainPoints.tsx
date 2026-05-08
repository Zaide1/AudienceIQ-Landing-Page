import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const painPoints = [
  { rank: 1, text: "Calorie logging is too time consuming", mentions: "12.4k", growth: "+42%", intensity: "High" },
  { rank: 2, text: "Barcode scanner behind paywall", mentions: "8.1k", growth: "+18%", intensity: "High" },
  { rank: 3, text: "Serving sizes are confusing/inconsistent", mentions: "6.2k", growth: "+5%", intensity: "Medium" },
  { rank: 4, text: "Apple Health sync failing silently", mentions: "4.8k", growth: "+21%", intensity: "High" },
  { rank: 5, text: "AI estimates from photos are inaccurate", mentions: "3.5k", growth: "+12%", intensity: "Medium" },
];

export function TrendingPainPoints() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Trending Pain Points
        </CardTitle>
        <Link href="/pain-points" className="text-xs text-primary font-medium hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ul className="divide-y divide-border/40">
          {painPoints.map((point) => (
            <li key={point.rank} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{point.rank}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{point.text}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {point.mentions} mentions
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      {point.growth}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] uppercase px-2 py-0.5 h-5 font-bold border-none ${
                    point.intensity === 'High' 
                      ? 'text-[#B91C1C] bg-[#FEE2E2]' 
                      : 'text-[#B45309] bg-[#FEF3C7]'
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
