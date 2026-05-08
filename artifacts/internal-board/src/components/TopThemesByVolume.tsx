import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Meal Logging", value: 4500, fill: "hsl(var(--primary))" },
  { name: "Macro Tracking", value: 3200, fill: "hsl(var(--chart-2))" },
  { name: "AI Workouts", value: 2800, fill: "hsl(var(--chart-3))" },
  { name: "Consistency", value: 1900, fill: "hsl(var(--chart-4))" },
  { name: "Nutrition Plans", value: 1200, fill: "hsl(var(--chart-5))" },
];

export function TopThemesByVolume() {
  return (
    <Card className="shadow-sm border-border h-full flex flex-col">
      <CardHeader className="pb-0 border-none">
        <CardTitle className="text-sm font-semibold">Top Themes by Volume</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 min-h-[250px] flex flex-col justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }} 
              width={100}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
