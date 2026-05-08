import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp } from "lucide-react";
import { Link } from "wouter";
import { SiReddit, SiX, SiTiktok, SiYoutube, SiInstagram } from "react-icons/si";
import type { IconType } from "react-icons";

type PlatformKey = "reddit" | "x" | "tiktok" | "youtube" | "instagram";

const PLATFORMS: Record<
  PlatformKey,
  { label: string; Icon: IconType; color: string; bg: string }
> = {
  reddit:    { label: "Reddit",       Icon: SiReddit,    color: "#FF4500", bg: "#FFF1EC" },
  x:         { label: "X (Twitter)",  Icon: SiX,         color: "#0F1419", bg: "#F1F2F4" },
  tiktok:    { label: "TikTok",       Icon: SiTiktok,    color: "#000000", bg: "#F1F2F4" },
  youtube:   { label: "YouTube",      Icon: SiYoutube,   color: "#FF0000", bg: "#FFECEC" },
  instagram: { label: "Instagram",    Icon: SiInstagram, color: "#E1306C", bg: "#FFEEF5" },
};

const quotes: Array<{
  id: number;
  text: string;
  author: string;
  time: string;
  platform: PlatformKey;
  subContext: string;
  engagement: string;
  tag: string;
}> = [
  {
    id: 1,
    text: "I gave up tracking because entering meals is annoying. If I make a mixed salad, calculating every ingredient takes 10 minutes. I just want to eat.",
    author: "FitnessFanatic",
    time: "2h ago",
    platform: "reddit",
    subContext: "r/loseit",
    engagement: "482",
    tag: "Meal Logging",
  },
  {
    id: 2,
    text: "MFP puts the barcode scanner behind a paywall now?! Time to delete. Anyone have good free alternatives that don't suck?",
    author: "@MacroTracker99",
    time: "5h ago",
    platform: "x",
    subContext: "X (Twitter)",
    engagement: "1,240",
    tag: "Pricing",
  },
  {
    id: 3,
    text: "Tried taking photos of my food for AI tracking. It thought my chicken breast was a potato. We are not there yet.",
    author: "@sarahlifts",
    time: "1d ago",
    platform: "tiktok",
    subContext: "TikTok comment",
    engagement: "8,402",
    tag: "AI Accuracy",
  },
  {
    id: 4,
    text: "Honestly, the best feature would be a 'log this meal again from yesterday' button. 80% of what I eat repeats.",
    author: "MealPrepDad",
    time: "2d ago",
    platform: "reddit",
    subContext: "r/EatCheapAndHealthy",
    engagement: "2,118",
    tag: "Friction",
  },
];

export function RealQuotesFeed() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real Quotes Feed
        </CardTitle>
        <Link href="/quotes" className="text-xs text-primary font-medium hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-border/40">
          {quotes.map((quote) => {
            const p = PLATFORMS[quote.platform];
            const Icon = p.Icon;
            return (
              <div
                key={quote.id}
                className="p-5 hover:bg-secondary/20 transition-colors flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: p.bg }}
                      aria-label={p.label}
                    >
                      <Icon style={{ color: p.color }} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-foreground">{quote.author}</span>
                      <span className="text-[10px] text-muted-foreground">{quote.subContext} · {quote.time}</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-secondary text-muted-foreground rounded-md px-1.5 py-0 border-none"
                  >
                    {p.label}
                  </Badge>
                </div>
                <p className="text-[14px] text-foreground leading-relaxed font-medium">"{quote.text}"</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <ArrowUp className="w-3 h-3" /> {quote.engagement}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] rounded-full px-2 py-0.5 font-medium border-border/50 text-muted-foreground"
                  >
                    {quote.tag}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
