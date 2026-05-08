import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const themes = [
  { name: "Meal Logging", value: 28400, displayValue: "28.4K", percentage: 100 },
  { name: "AI Workouts", value: 18200, displayValue: "18.2K", percentage: 64 },
  { name: "Macro Tracking", value: 15400, displayValue: "15.4K", percentage: 54 },
  { name: "Nutrition Plans", value: 9800, displayValue: "9.8K", percentage: 34 },
  { name: "Consistency", value: 6200, displayValue: "6.2K", percentage: 21 },
];

export function TopThemesByVolume() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold">Top Themes by Volume</CardTitle>
        <a href="#" className="text-xs text-primary font-medium hover:underline">View all</a>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center gap-4">
        {themes.map((theme, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span>{theme.name}</span>
              <span className="text-muted-foreground">{theme.displayValue}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7c3aed] rounded-full" 
                style={{ width: `${theme.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
