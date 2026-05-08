import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const data = [
  { date: "Mon", meal: 120, ai: 40, macro: 80 },
  { date: "Tue", meal: 132, ai: 55, macro: 85 },
  { date: "Wed", meal: 140, ai: 80, macro: 75 },
  { date: "Thu", meal: 125, ai: 110, macro: 90 },
  { date: "Fri", meal: 150, ai: 135, macro: 85 },
  { date: "Sat", meal: 170, ai: 150, macro: 95 },
  { date: "Sun", meal: 185, ai: 190, macro: 100 },
];

export function MentionsOverTime() {
  return (
    <Card className="shadow-sm border-border h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Mentions Over Time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 min-h-[250px]">
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
            <Line type="monotone" name="Meal logging" dataKey="meal" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" name="AI calorie accuracy" dataKey="ai" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" name="Macro tracking" dataKey="macro" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
