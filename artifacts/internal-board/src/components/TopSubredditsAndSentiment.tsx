import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const subreddits = [
  { name: "r/loseit", mentions: "12.4k", growth: "↑ 26%", trend: "up" },
  { name: "r/xxfitness", mentions: "8.2k", growth: "↑ 12%", trend: "up" },
  { name: "r/MyFitnessPal", mentions: "4.1k", growth: "↓ 8%", trend: "down" },
  { name: "r/MacroFactor", mentions: "3.8k", growth: "↑ 42%", trend: "up" },
  { name: "r/nutrition", mentions: "2.9k", growth: "0%", trend: "flat" },
];

const sentimentData = [
  { date: "May 12", pos: 30, neu: 50, neg: 20 },
  { date: "May 14", pos: 32, neu: 48, neg: 22 },
  { date: "May 16", pos: 28, neu: 45, neg: 35 },
  { date: "May 18", pos: 25, neu: 40, neg: 45 },
  { date: "May 20", pos: 22, neu: 38, neg: 55 },
  { date: "May 22", pos: 20, neu: 35, neg: 60 },
  { date: "May 24", pos: 18, neu: 30, neg: 65 },
  { date: "May 26", pos: 16, neu: 28, neg: 70 },
];

export function TopSubredditsAndSentiment() {
  return (
    <div className="flex flex-col gap-6 h-full col-span-1 md:col-span-2 lg:col-span-1">
      {/* Top Subreddits */}
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px] flex-1 flex flex-col">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
          <CardTitle className="text-[14px] font-semibold">Top Subreddits by Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ul className="divide-y divide-border/40">
            {subreddits.map((sub, i) => (
              <li key={i} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <span className="text-[13px] font-medium text-foreground">{sub.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-medium">{sub.mentions} mentions</span>
                  <div className={`flex items-center w-12 justify-end text-xs font-bold ${
                    sub.trend === 'up' ? 'text-emerald-600' : sub.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {sub.growth}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sentiment Trend */}
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px] flex-1 flex flex-col min-h-[220px]">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
          <CardTitle className="text-[14px] font-semibold">Sentiment Trend (All Competitors)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex-1 relative">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '11px', padding: '8px' }}
              />
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Area type="monotone" stackId="1" dataKey="pos" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} name="Positive" />
              <Area type="monotone" stackId="1" dataKey="neu" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} name="Neutral" />
              <Area type="monotone" stackId="1" dataKey="neg" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} name="Negative" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
