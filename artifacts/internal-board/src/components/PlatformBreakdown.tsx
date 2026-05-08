import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

const data = [
  { name: "Reddit", value: 62100, displayValue: "62.1K", percentage: "48.2%", fill: "#ff4500" },
  { name: "TikTok", value: 30400, displayValue: "30.4K", percentage: "23.7%", fill: "#000000" },
  { name: "X (Twitter)", value: 19700, displayValue: "19.7K", percentage: "14.1%", fill: "#1da1f2" },
  { name: "YouTube", value: 9100, displayValue: "9.1K", percentage: "7.1%", fill: "#ff0000" },
  { name: "Others", value: 8400, displayValue: "8.4K", percentage: "6.9%", fill: "#9ca3af" },
];

export function PlatformBreakdown() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold">Platform Breakdown</CardTitle>
        <Link href="/platforms" className="text-xs text-primary font-medium hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex items-center justify-between gap-4">
        <div className="w-1/2 h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold text-foreground leading-none">128.7K</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-1">Total Mentions</span>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">{item.percentage}</span>
                <span className="text-muted-foreground hidden lg:inline">({item.displayValue})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
