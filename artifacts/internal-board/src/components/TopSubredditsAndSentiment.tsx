import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const subreddits = [
  { name: "r/loseit", mentions: "12.4k", growth: "+14%", trend: "up" },
  { name: "r/xxfitness", mentions: "8.2k", growth: "+5%", trend: "up" },
  { name: "r/MyFitnessPal", mentions: "4.1k", growth: "-12%", trend: "down" },
  { name: "r/MacroFactor", mentions: "3.8k", growth: "+42%", trend: "up" },
  { name: "r/nutrition", mentions: "2.9k", growth: "0%", trend: "flat" },
];

const sentimentData = [
  { date: "1", pos: 30, neu: 50, neg: 20 },
  { date: "2", pos: 32, neu: 48, neg: 22 },
  { date: "3", pos: 28, neu: 45, neg: 35 },
  { date: "4", pos: 25, neu: 40, neg: 45 },
  { date: "5", pos: 22, neu: 38, neg: 55 },
  { date: "6", pos: 20, neu: 35, neg: 60 },
  { date: "7", pos: 18, neu: 30, neg: 65 },
];

export function TopSubredditsAndSentiment() {
  return (
    <div className="flex flex-col gap-4 h-full col-span-1 md:col-span-2 lg:col-span-1">
      {/* Top Subreddits */}
      <Card className="shadow-sm border-border flex-1">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Top Subreddits by Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/50">
            {subreddits.map((sub, i) => (
              <li key={i} className="p-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <span className="text-sm font-medium text-foreground">{sub.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{sub.mentions}</span>
                  <div className={`flex items-center w-12 justify-end text-xs font-medium ${
                    sub.trend === 'up' ? 'text-emerald-600' : sub.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {sub.growth}
                    {sub.trend === 'up' ? <TrendingUp className="w-3 h-3 ml-1" /> : sub.trend === 'down' ? <TrendingDown className="w-3 h-3 ml-1" /> : <Minus className="w-3 h-3 ml-1" />}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sentiment Trend */}
      <Card className="shadow-sm border-border h-48">
        <CardHeader className="pb-0 pt-3 border-none">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sentiment Trend (All Competitors)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-[130px]">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '11px', padding: '4px 8px' }}
                itemStyle={{ padding: 0 }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" stackId="1" dataKey="neg" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} name="Negative" />
              <Area type="monotone" stackId="1" dataKey="neu" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.2} strokeWidth={2} name="Neutral" />
              <Area type="monotone" stackId="1" dataKey="pos" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="Positive" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
