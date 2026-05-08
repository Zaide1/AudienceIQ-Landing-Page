import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { KPIRow } from "@/components/KPIRow";
import { TrendingPainPoints } from "@/components/TrendingPainPoints";
import { MentionsOverTime } from "@/components/MentionsOverTime";
import { ViralPostOpportunities } from "@/components/ViralPostOpportunities";
import { RealQuotesFeed } from "@/components/RealQuotesFeed";
import { TopThemesByVolume } from "@/components/TopThemesByVolume";
import { PlatformBreakdown } from "@/components/PlatformBreakdown";
import { ContentIdeas } from "@/components/ContentIdeas";
import { TopSubredditsAndSentiment } from "@/components/TopSubredditsAndSentiment";
import { CompetitorWatchAndSaved } from "@/components/CompetitorWatchAndSaved";

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/20">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
          <TopBar />
          
          <KPIRow />

          <div className="flex flex-col gap-6">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrendingPainPoints />
              <MentionsOverTime />
              <ViralPostOpportunities />
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RealQuotesFeed />
              <TopThemesByVolume />
              <PlatformBreakdown />
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentIdeas />
              <TopSubredditsAndSentiment />
              <CompetitorWatchAndSaved />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
