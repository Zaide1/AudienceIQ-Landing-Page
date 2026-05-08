import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Reddit", value: 45, fill: "#ff4500" },
  { name: "TikTok", value: 25, fill: "#000000" },
  { name: "X/Twitter", value: 15, fill: "#1da1f2" },
  { name: "YouTube", value: 10, fill: "#ff0000" },
  { name: "Others", value: 5, fill: "#9ca3af" },
];

export function PlatformBreakdown() {
  return (
    <Card className="shadow-sm border-border h-full flex flex-col">
      <CardHeader className="pb-0 border-none">
        <CardTitle className="text-sm font-semibold">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-center min-h-[250px]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              formatter={(value) => [`${value}%`, 'Share']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
