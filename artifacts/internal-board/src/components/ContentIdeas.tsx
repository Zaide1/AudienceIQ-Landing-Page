import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const drafts = {
  tweets: [
    "Most fitness apps are built for accountants, not normal people. We don't want to calculate the macro split of a mixed salad. We just want to know if we're on track.",
    "The fitness industry's biggest lie: 'Tracking is easy if you build the habit'. No, tracking is hard because the software requires 8 taps to log a banana.",
  ],
  threads: [
    "I analyzed 10,000 complaints about top fitness apps. Here's what people actually hate (and it's not the subscription price): \n\n1/ The 'Search' Friction...",
  ]
};

export function ContentIdeas() {
  return (
    <Card className="shadow-sm border-border h-full flex flex-col col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-2 border-none">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Content Ideas
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Auto-Generated</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <Tabs defaultValue="tweets" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 h-8 mb-4">
            <TabsTrigger value="tweets" className="text-xs">Tweets</TabsTrigger>
            <TabsTrigger value="threads" className="text-xs">Threads</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs disabled:opacity-50">Charts</TabsTrigger>
            <TabsTrigger value="carousels" className="text-xs disabled:opacity-50">Carousels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="flex-1 mt-0">
            <div className="space-y-3">
              {drafts.tweets.map((tweet, i) => (
                <div key={i} className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm text-foreground leading-relaxed">
                  {tweet}
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">
                      Edit in Studio <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="threads" className="flex-1 mt-0">
             <div className="space-y-3">
              {drafts.threads.map((thread, i) => (
                <div key={i} className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {thread}
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">
                      Continue <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
