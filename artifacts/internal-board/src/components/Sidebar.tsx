import { Link } from "wouter";
import { Activity, LayoutDashboard, Zap, List, PenTool, Image, AlertCircle, Bookmark, FileText, Settings, UserCircle, Globe, MessagesSquare, Users, BarChart3, Bell, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  return (
    <div className="w-64 h-full border-r border-border bg-sidebar flex flex-col hidden md:flex shrink-0">
      <div className="p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">AudienceIQ</span>
        </div>
        <Badge variant="outline" className="w-fit text-[10px] font-mono uppercase bg-background px-1.5 py-0">
          Internal Ops
        </Badge>
      </div>

      <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Intelligence
          </h4>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-secondary text-foreground">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Content Board
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Zap className="w-4 h-4" />
            Trending Signals
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <AlertCircle className="w-4 h-4" />
            Pain Points
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <ArrowUpRight className="w-4 h-4" />
            Viral Opportunities
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <MessagesSquare className="w-4 h-4" />
            Quotes Feed
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Globe className="w-4 h-4" />
            Niche Explorer
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Users className="w-4 h-4" />
            Competitor Watch
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Content Studio
          </h4>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <PenTool className="w-4 h-4" />
            Tweet Ideas
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <List className="w-4 h-4" />
            Thread Builder
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Bookmark className="w-4 h-4" />
            Hooks Library
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Image className="w-4 h-4" />
            Visual Ideas
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Monitoring
          </h4>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <Bell className="w-4 h-4" />
            Alerts
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <FileText className="w-4 h-4" />
            Sources
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Reports
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Jane Doe</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Admin <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/20 text-primary bg-primary/5">PRO</Badge>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
