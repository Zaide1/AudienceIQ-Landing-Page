import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const kpiData = [
  {
    title: "Total Mentions",
    metric: "128.7K",
    growth: "+14.2% vs last 7 days",
    trend: "up",
    color: "#3b82f6",
    data: [{ value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, { value: 130 }, { value: 160 }, { value: 190 }]
  },
  {
    title: "Unique Pain Points",
    metric: "1,246",
    growth: "+5.1% vs last 7 days",
    trend: "up",
    color: "#7c3aed",
    data: [{ value: 50 }, { value: 60 }, { value: 55 }, { value: 70 }, { value: 65 }, { value: 80 }, { value: 85 }]
  },
  {
    title: "High Intensity Mentions",
    metric: "18.3K",
    growth: "+22.4% vs last 7 days",
    trend: "up",
    color: "#ef4444",
    data: [{ value: 20 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 45 }, { value: 60 }, { value: 80 }]
  },
  {
    title: "Emerging Topics",
    metric: "312",
    growth: "+12.0% vs last 7 days",
    trend: "up",
    color: "#10b981",
    data: [{ value: 10 }, { value: 15 }, { value: 12 }, { value: 18 }, { value: 16 }, { value: 20 }, { value: 25 }]
  }
];

export function KPIRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="shadow-none border-[#E5E7EB] rounded-[12px] overflow-hidden h-[130px] flex flex-col">
          <CardContent className="p-4 pb-0 flex flex-col justify-between flex-1 relative">
            <div className="flex flex-col z-10">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{kpi.title}</h3>
              <div className="text-[28px] font-bold tracking-tight text-foreground leading-none">{kpi.metric}</div>
              <div className={`text-[11px] font-medium mt-1 ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.growth}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={kpi.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={kpi.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={kpi.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#gradient-${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Engagement Potential Card */}
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px] overflow-hidden h-[130px] flex flex-col">
        <CardContent className="p-4 flex flex-row items-center justify-between h-full">
          <div className="flex flex-col h-full justify-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Engagement Potential</h3>
            <div className="text-[28px] font-bold tracking-tight text-foreground leading-none">High</div>
            <div className="text-[11px] font-medium mt-1 text-muted-foreground">Strong this week</div>
          </div>
          <div className="w-16 h-16 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={[{ name: "score", value: 78, fill: "#7c3aed" }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
              78
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
