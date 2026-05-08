import { RefreshCw, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Board</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your real-time pipeline of insights and content opportunities.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border/60">
          <CalendarIcon className="w-3.5 h-3.5 mr-2" />
          Last 7 Days
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border/60">
          <Filter className="w-3.5 h-3.5 mr-2" />
          Filters
        </Button>
        <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-foreground text-background hover:bg-foreground/90">
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
