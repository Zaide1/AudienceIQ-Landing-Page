import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ThumbsUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quotes = [
  {
    id: 1,
    text: "I gave up tracking because entering meals is annoying. If I make a mixed salad, calculating every ingredient takes 10 minutes. I just want to eat.",
    source: "Reddit",
    platform: "r/xxfitness",
    engagement: "4.2k",
    tags: ["Friction", "Meal Prep"]
  },
  {
    id: 2,
    text: "MFP puts the barcode scanner behind a paywall now?! Time to delete. Anyone have good free alternatives that don't suck?",
    source: "Reddit",
    platform: "r/loseit",
    engagement: "8.1k",
    tags: ["Pricing", "Competitor"]
  },
  {
    id: 3,
    text: "Tried taking photos of my food for AI tracking. It thought my chicken breast was a potato. We are not there yet.",
    source: "Twitter",
    platform: "Tech/Fitness",
    engagement: "1.2k",
    tags: ["AI Accuracy", "Product Insight"]
  },
  {
    id: 4,
    text: "Chronometer's database is way more accurate but the UI feels like it was built in 2004 for accountants.",
    source: "Review",
    platform: "App Store",
    engagement: "342",
    tags: ["UI/UX", "Competitor"]
  }
];

export function RealQuotesFeed() {
  return (
    <Card className="shadow-sm border-border h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            Real Quotes Feed
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-border/50">
          {quotes.map((quote) => (
            <div key={quote.id} className="p-4 hover:bg-secondary/20 transition-colors">
              <p className="text-sm text-foreground leading-relaxed mb-3 font-medium">"{quote.text}"</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{quote.platform}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {quote.engagement}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {quote.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] bg-secondary/50 font-normal px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
