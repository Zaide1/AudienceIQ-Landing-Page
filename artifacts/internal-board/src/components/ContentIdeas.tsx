import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const drafts = {
  tweets: [
    "Most fitness apps are built for accountants, not normal people. We don't want to calculate the macro split of a mixed salad. We just want to know if we're on track.",
    "The fitness industry's biggest lie: 'Tracking is easy if you build the habit'. No, tracking is hard because the software requires 8 taps to log a banana."
  ]
};

export function ContentIdeas() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          Content Ideas
        </CardTitle>
        <a href="#" className="text-xs text-primary font-medium hover:underline">View all</a>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <Tabs defaultValue="tweets" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 h-9 mb-4 bg-secondary/50 p-1">
            <TabsTrigger value="tweets" className="text-xs font-medium rounded-md">Tweets</TabsTrigger>
            <TabsTrigger value="threads" className="text-xs font-medium rounded-md">Threads</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs font-medium rounded-md disabled:opacity-50">Charts</TabsTrigger>
            <TabsTrigger value="carousels" className="text-xs font-medium rounded-md disabled:opacity-50">Carousels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="flex-1 mt-0 flex flex-col gap-3">
            {drafts.tweets.map((tweet, i) => (
              <div key={i} className="bg-secondary/40 p-4 rounded-lg border border-border/60 text-[13px] text-foreground leading-relaxed relative group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white rounded-md transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white rounded-md transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                "{tweet}"
              </div>
            ))}
            <Button className="w-full mt-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold rounded-lg py-5 shadow-sm">
              Generate More Ideas
            </Button>
          </TabsContent>
          
          <TabsContent value="threads" className="flex-1 mt-0" />
        </Tabs>
      </CardContent>
    </Card>
  );
}
