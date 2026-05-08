import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUp } from "lucide-react";

const quotes = [
  {
    id: 1,
    text: "I gave up tracking because entering meals is annoying. If I make a mixed salad, calculating every ingredient takes 10 minutes. I just want to eat.",
    author: "FitnessFanatic",
    time: "2h ago",
    platform: "r/loseit",
    engagement: "482",
    tag: "Meal Logging",
    avatar: "FF"
  },
  {
    id: 2,
    text: "MFP puts the barcode scanner behind a paywall now?! Time to delete. Anyone have good free alternatives that don't suck?",
    author: "MacroTracker99",
    time: "5h ago",
    platform: "X (Twitter)",
    engagement: "1,240",
    tag: "Pricing",
    avatar: "MT"
  },
  {
    id: 3,
    text: "Tried taking photos of my food for AI tracking. It thought my chicken breast was a potato. We are not there yet.",
    author: "SarahLifts",
    time: "1d ago",
    platform: "TikTok Comments",
    engagement: "8,402",
    tag: "AI Accuracy",
    avatar: "SL"
  }
];

export function RealQuotesFeed() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real Quotes Feed
        </CardTitle>
        <a href="#" className="text-xs text-primary font-medium hover:underline">View all</a>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-border/40">
          {quotes.map((quote) => (
            <div key={quote.id} className="p-5 hover:bg-secondary/20 transition-colors flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border">
                    <AvatarFallback className="text-[10px] bg-secondary text-muted-foreground">{quote.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground">{quote.author} · {quote.time}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-medium bg-secondary text-muted-foreground rounded-md px-1.5 py-0 border-none">
                  {quote.platform}
                </Badge>
              </div>
              <p className="text-[14px] text-foreground leading-relaxed font-medium">"{quote.text}"</p>
              <div className="flex items-center justify-between mt-1">
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <ArrowUp className="w-3 h-3" /> {quote.engagement}
                </span>
                <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 font-medium border-border/50 text-muted-foreground">
                  {quote.tag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
