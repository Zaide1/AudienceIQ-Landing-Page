import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const kpiData = [
  {
    title: "Total Mentions",
    metric: "12,482",
    growth: "+14.2%",
    trend: "up",
    data: [
      { value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, { value: 130 }, { value: 160 }, { value: 190 }
    ]
  },
  {
    title: "Unique Pain Points",
    metric: "348",
    growth: "+5.1%",
    trend: "up",
    data: [
      { value: 50 }, { value: 60 }, { value: 55 }, { value: 70 }, { value: 65 }, { value: 80 }, { value: 85 }
    ]
  },
  {
    title: "High Intensity Mentions",
    metric: "2,104",
    growth: "+22.4%",
    trend: "up",
    data: [
      { value: 20 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 45 }, { value: 60 }, { value: 80 }
    ]
  },
  {
    title: "Emerging Topics",
    metric: "42",
    growth: "+12.0%",
    trend: "up",
    data: [
      { value: 10 }, { value: 15 }, { value: 12 }, { value: 18 }, { value: 16 }, { value: 20 }, { value: 25 }
    ]
  },
  {
    title: "Engagement Potential",
    metric: "8.4k",
    growth: "-2.1%",
    trend: "down",
    data: [
      { value: 80 }, { value: 70 }, { value: 75 }, { value: 60 }, { value: 50 }, { value: 55 }, { value: 40 }
    ]
  }
];

export function KPIRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="shadow-sm border-border overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">{kpi.title}</h3>
              <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.growth}
              </span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-2xl font-semibold tracking-tight text-foreground">{kpi.metric}</div>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.data}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={kpi.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={kpi.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.trend === 'up' ? '#10b981' : '#ef4444'}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill={`url(#gradient-${index})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
