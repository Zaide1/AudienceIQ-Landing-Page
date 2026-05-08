import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Link } from "wouter";

const data = [
  { date: "May 12", meal: 120, ai: 40, macro: 80 },
  { date: "May 14", meal: 132, ai: 55, macro: 85 },
  { date: "May 16", meal: 140, ai: 80, macro: 75 },
  { date: "May 18", meal: 125, ai: 110, macro: 90 },
  { date: "May 20", meal: 150, ai: 135, macro: 85 },
  { date: "May 22", meal: 170, ai: 150, macro: 95 },
  { date: "May 24", meal: 185, ai: 190, macro: 100 },
  { date: "May 26", meal: 210, ai: 220, macro: 110 }
];

export function MentionsOverTime() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Mentions Over Time
        </CardTitle>
        <Link href="/mentions" className="text-xs text-primary font-medium hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-5 flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              labelStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            />
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Line type="monotone" name="Meal logging" dataKey="meal" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
            <Line type="monotone" name="AI calorie accuracy" dataKey="ai" stroke="#f97316" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
            <Line type="monotone" name="Macro tracking" dataKey="macro" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
