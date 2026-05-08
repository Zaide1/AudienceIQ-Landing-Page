import { Link, useLocation } from "wouter";
import {
  Activity,
  LayoutDashboard,
  Zap,
  PenTool,
  Image as ImageIcon,
  AlertCircle,
  Bookmark,
  FileText,
  UserCircle,
  Globe,
  MessagesSquare,
  Users,
  BarChart3,
  Bell,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type NavItem = { label: string; href: string; icon: LucideIcon };

const intelligence: NavItem[] = [
  { label: "Content Board",        href: "/",                    icon: LayoutDashboard },
  { label: "Pain Points",          href: "/pain-points",         icon: AlertCircle },
  { label: "Trending Signals",     href: "/mentions",            icon: TrendingUp },
  { label: "Viral Opportunities",  href: "/viral-opportunities", icon: ArrowUpRight },
  { label: "Quotes Feed",          href: "/quotes",              icon: MessagesSquare },
  { label: "Themes",               href: "/themes",              icon: Zap },
  { label: "Platforms",            href: "/platforms",           icon: PieIcon },
  { label: "Subreddits",           href: "/subreddits",          icon: Globe },
  { label: "Competitor Watch",     href: "/competitor-watch",    icon: Users },
];

const studio: NavItem[] = [
  { label: "Content Ideas",  href: "/content-ideas", icon: PenTool },
  { label: "Saved Insights", href: "/saved",         icon: Bookmark },
  { label: "Visual Ideas",   href: "#",              icon: ImageIcon },
];

const monitoring: NavItem[] = [
  { label: "Sentiment", href: "/sentiment", icon: BarChart3 },
  { label: "Alerts",    href: "#",          icon: Bell },
  { label: "Sources",   href: "#",          icon: FileText },
];

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 mb-1.5">
      {children}
    </h4>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const isAnchor = item.href === "#";
  const className = `flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
    active
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer"
  }`;
  const content = (
    <>
      <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
      {item.label}
    </>
  );
  if (isAnchor) {
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex w-56 lg:w-52 h-full border-r border-border bg-sidebar flex-col shrink-0">
      <div className="px-4 pt-5 pb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">AudienceIQ</span>
        </div>
        <Badge variant="outline" className="w-fit text-[9px] font-mono uppercase bg-background px-1.5 py-0">
          Internal Ops
        </Badge>
      </div>

      <div className="flex-1 px-2 py-1 space-y-4 overflow-y-auto">
        <div className="space-y-0.5">
          <SectionHeader>Intelligence</SectionHeader>
          {intelligence.map((item) => (
            <NavRow key={item.label} item={item} active={location === item.href} />
          ))}
        </div>

        <div className="space-y-0.5">
          <SectionHeader>Content Studio</SectionHeader>
          {studio.map((item) => (
            <NavRow key={item.label} item={item} active={location === item.href} />
          ))}
        </div>

        <div className="space-y-0.5">
          <SectionHeader>Monitoring</SectionHeader>
          {monitoring.map((item) => (
            <NavRow key={item.label} item={item} active={location === item.href} />
          ))}
        </div>
      </div>

      <div className="px-3 py-3 border-t border-border mt-auto">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-medium">Jane Doe</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              Admin
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-primary/20 text-primary bg-primary/5">
                PRO
              </Badge>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
