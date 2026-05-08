import { DetailLayout, DetailToolbarButton } from "@/components/DetailLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  ArrowUp,
  Copy,
  Share2,
  Bookmark,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from "recharts";
import {
  SiReddit,
  SiX,
  SiTiktok,
  SiYoutube,
  SiInstagram,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import type { IconType } from "react-icons";

type PlatformKey = "reddit" | "x" | "tiktok" | "youtube" | "instagram";
const PLATFORMS: Record<
  PlatformKey,
  { label: string; Icon: IconType; color: string; bg: string }
> = {
  reddit:    { label: "Reddit",      Icon: SiReddit,    color: "#FF4500", bg: "#FFF1EC" },
  x:         { label: "X (Twitter)", Icon: SiX,         color: "#0F1419", bg: "#F1F2F4" },
  tiktok:    { label: "TikTok",      Icon: SiTiktok,    color: "#000000", bg: "#F1F2F4" },
  youtube:   { label: "YouTube",     Icon: SiYoutube,   color: "#FF0000", bg: "#FFECEC" },
  instagram: { label: "Instagram",   Icon: SiInstagram, color: "#E1306C", bg: "#FFEEF5" },
};

function ToolbarSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="h-9 pl-8 text-xs w-[220px] bg-background"
      />
    </div>
  );
}

function intensityClass(level: "High" | "Medium" | "Low") {
  if (level === "High") return "text-[#B91C1C] bg-[#FEE2E2]";
  if (level === "Medium") return "text-[#B45309] bg-[#FEF3C7]";
  return "text-emerald-700 bg-emerald-100";
}

/* ============================================================
   Pain Points
   ============================================================ */
const painPointsAll = [
  { rank: 1, text: "Calorie logging is too time consuming", mentions: "12.4k", growth: "+42%", intensity: "High" as const, theme: "Meal Logging" },
  { rank: 2, text: "Barcode scanner behind paywall", mentions: "8.1k", growth: "+18%", intensity: "High" as const, theme: "Pricing" },
  { rank: 3, text: "Serving sizes are confusing/inconsistent", mentions: "6.2k", growth: "+5%", intensity: "Medium" as const, theme: "Meal Logging" },
  { rank: 4, text: "Apple Health sync failing silently", mentions: "4.8k", growth: "+21%", intensity: "High" as const, theme: "Integrations" },
  { rank: 5, text: "AI estimates from photos are inaccurate", mentions: "3.5k", growth: "+12%", intensity: "Medium" as const, theme: "AI Accuracy" },
  { rank: 6, text: "Recipe import is broken in the latest version", mentions: "2.9k", growth: "+38%", intensity: "High" as const, theme: "Reliability" },
  { rank: 7, text: "Can't customize macro targets without premium", mentions: "2.5k", growth: "+9%", intensity: "Medium" as const, theme: "Pricing" },
  { rank: 8, text: "Streak resets when timezone changes during travel", mentions: "1.8k", growth: "+14%", intensity: "Medium" as const, theme: "Bugs" },
  { rank: 9, text: "Database has duplicate entries for the same food", mentions: "1.6k", growth: "+3%", intensity: "Low" as const, theme: "Data Quality" },
  { rank: 10, text: "Push notifications are too aggressive", mentions: "1.2k", growth: "-2%", intensity: "Low" as const, theme: "UX" },
  { rank: 11, text: "Apple Watch app drains battery", mentions: "980", growth: "+22%", intensity: "Medium" as const, theme: "Performance" },
  { rank: 12, text: "Onboarding asks for too much info upfront", mentions: "740", growth: "+6%", intensity: "Low" as const, theme: "Onboarding" },
];

export function PainPointsPage() {
  return (
    <DetailLayout
      title="Pain Points"
      description="Every recurring user complaint we've detected across Reddit, TikTok, X and YouTube — ranked by intensity and growth."
      actions={
        <>
          <ToolbarSearch placeholder="Search pain points…" />
          <DetailToolbarButton>
            <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters
          </DetailToolbarButton>
          <DetailToolbarButton>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </DetailToolbarButton>
        </>
      }
    >
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {painPointsAll.map((p) => (
              <li key={p.rank} className="px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-muted-foreground w-5">{p.rank}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground">{p.text}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-muted-foreground font-medium">{p.mentions} mentions</span>
                      <span className={`font-semibold ${p.growth.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}>{p.growth}</span>
                      <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 font-medium border-border/50 text-muted-foreground">
                        {p.theme}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`text-[10px] uppercase px-2 py-0.5 h-5 font-bold border-none ${intensityClass(p.intensity)}`}>
                    {p.intensity}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Viral Opportunities
   ============================================================ */
const viralAll = [
  { id: 1, type: "CONTRARIAN",  potential: "Very High", angle: "People don't want accurate calorie tracking — they want frictionless logging.", platforms: ["x","linkedin","reddit"] as const },
  { id: 2, type: "OBSERVATION", potential: "High",      angle: "MyFitnessPal's barcode scanner being paywalled is the single biggest churn driver in fitness tech right now.", platforms: ["x","linkedin","reddit"] as const },
  { id: 3, type: "TREND",       potential: "Medium",    angle: "We're moving from 'tracking macros' to 'AI estimating portions from a photo'. The gap is still trust.", platforms: ["x","linkedin","tiktok"] as const },
  { id: 4, type: "DATA",        potential: "Very High", angle: "42% of fitness app churn happens within the first 7 days — onboarding length is the single biggest predictor.", platforms: ["x","linkedin"] as const },
  { id: 5, type: "QUOTE",       potential: "High",      angle: "'I just want a button that says re-log yesterday.' — top upvoted comment on r/loseit this week.", platforms: ["x","reddit"] as const },
  { id: 6, type: "CONTRARIAN",  potential: "High",      angle: "Streaks are addictive, not motivating. The apps that stop using them will win the long-game cohort.", platforms: ["x","linkedin"] as const },
  { id: 7, type: "TREND",       potential: "Medium",    angle: "Wearable companies are quietly becoming nutrition companies. Watch the next 12 months.", platforms: ["x","linkedin","tiktok"] as const },
  { id: 8, type: "OBSERVATION", potential: "Medium",    angle: "European users overwhelmingly choose Yazio. There's a localization moat US apps haven't noticed.", platforms: ["x","linkedin"] as const },
];

function buildPostUrl(platform: "x"|"linkedin"|"reddit"|"tiktok", text: string): string {
  const t = encodeURIComponent(text);
  switch (platform) {
    case "x": return `https://twitter.com/intent/tweet?text=${t}`;
    case "linkedin": return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://audienceiq.app")}&summary=${t}`;
    case "reddit": return `https://www.reddit.com/submit?title=${t}`;
    case "tiktok": return `https://www.tiktok.com/upload?lang=en`;
  }
}

const POST_PLATFORMS = {
  x:        { label: "Post on X",        Icon: SiX,         color: "#0F1419", bg: "#F1F2F4" },
  linkedin: { label: "Post on LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2", bg: "#E8F2FB" },
  reddit:   { label: "Post on Reddit",   Icon: SiReddit,    color: "#FF4500", bg: "#FFF1EC" },
  tiktok:   { label: "Post on TikTok",   Icon: SiTiktok,    color: "#000000", bg: "#F1F2F4" },
} as const;

export function ViralOpportunitiesPage() {
  return (
    <DetailLayout
      title="Viral Post Opportunities"
      description="Angles ranked by predicted virality — copy a draft, or post directly to your channels."
      actions={
        <>
          <ToolbarSearch placeholder="Search angles…" />
          <DetailToolbarButton>
            <Filter className="w-3.5 h-3.5 mr-1.5" /> All types
          </DetailToolbarButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viralAll.map((opp) => (
          <Card key={opp.id} className="shadow-none border-[#E5E7EB] rounded-[12px] bg-[#faf5ff]/40">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{opp.type}</span>
                <Badge variant="secondary" className="text-[10px] font-medium bg-[#f3e8ff] text-primary border-none px-2 py-0.5 rounded-full">
                  {opp.potential} Potential
                </Badge>
              </div>
              <p className="text-[14px] font-medium text-foreground leading-snug">"{opp.angle}"</p>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] font-medium text-muted-foreground">Post to</span>
                <div className="flex gap-1.5">
                  {opp.platforms.map((key) => {
                    const p = POST_PLATFORMS[key];
                    const Icon = p.Icon;
                    return (
                      <a
                        key={key}
                        href={buildPostUrl(key, opp.angle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={p.label}
                        aria-label={p.label}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border/60 hover:scale-105 transition-transform"
                        style={{ background: p.bg }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DetailLayout>
  );
}

/* ============================================================
   Quotes
   ============================================================ */
const quotesAll: Array<{
  id: number;
  text: string;
  author: string;
  time: string;
  platform: PlatformKey;
  subContext: string;
  engagement: string;
  tag: string;
}> = [
  { id: 1, text: "I gave up tracking because entering meals is annoying. If I make a mixed salad, calculating every ingredient takes 10 minutes. I just want to eat.", author: "FitnessFanatic", time: "2h ago", platform: "reddit", subContext: "r/loseit", engagement: "482", tag: "Meal Logging" },
  { id: 2, text: "MFP puts the barcode scanner behind a paywall now?! Time to delete. Anyone have good free alternatives that don't suck?", author: "@MacroTracker99", time: "5h ago", platform: "x", subContext: "X (Twitter)", engagement: "1,240", tag: "Pricing" },
  { id: 3, text: "Tried taking photos of my food for AI tracking. It thought my chicken breast was a potato. We are not there yet.", author: "@sarahlifts", time: "1d ago", platform: "tiktok", subContext: "TikTok comment", engagement: "8,402", tag: "AI Accuracy" },
  { id: 4, text: "Honestly, the best feature would be a 'log this meal again from yesterday' button. 80% of what I eat repeats.", author: "MealPrepDad", time: "2d ago", platform: "reddit", subContext: "r/EatCheapAndHealthy", engagement: "2,118", tag: "Friction" },
  { id: 5, text: "Cronometer is what MFP wishes it was. The micronutrient detail alone is worth switching.", author: "NutritionNerd", time: "2d ago", platform: "reddit", subContext: "r/nutrition", engagement: "612", tag: "Competitor" },
  { id: 6, text: "Why is every fitness app a subscription now? I just want to log calories like in 2014.", author: "@grumpylifter", time: "3d ago", platform: "x", subContext: "X (Twitter)", engagement: "3,401", tag: "Pricing" },
  { id: 7, text: "Streak day 412. The app is the only reason I'm still tracking. Take that away and I'm out.", author: "ConsistencyKing", time: "3d ago", platform: "reddit", subContext: "r/loseit", engagement: "920", tag: "Retention" },
  { id: 8, text: "POV: you spend 6 minutes logging dinner and it tells you you're 80 calories over.", author: "@fitfoodfailure", time: "4d ago", platform: "tiktok", subContext: "TikTok comment", engagement: "12,400", tag: "UX" },
  { id: 9, text: "MyFitnessPal Apple Health sync hasn't worked for me since the redesign. Customer support said 'try reinstalling'. Useless.", author: "iOSFitnessUser", time: "5d ago", platform: "reddit", subContext: "r/iphone", engagement: "445", tag: "Integrations" },
  { id: 10, text: "Lose It! has the best onboarding of any nutrition app I've used. MFP could learn a lot.", author: "@ProductHunter", time: "6d ago", platform: "x", subContext: "X (Twitter)", engagement: "188", tag: "Competitor" },
];

export function QuotesPage() {
  return (
    <DetailLayout
      title="Real Quotes Feed"
      description="Verbatim user voices from Reddit, X, TikTok, YouTube and Instagram — the words your customers actually use."
      actions={
        <>
          <ToolbarSearch placeholder="Search quotes…" />
          <DetailToolbarButton>
            <Filter className="w-3.5 h-3.5 mr-1.5" /> All platforms
          </DetailToolbarButton>
          <DetailToolbarButton>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </DetailToolbarButton>
        </>
      }
    >
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {quotesAll.map((q) => {
              const p = PLATFORMS[q.platform];
              const Icon = p.Icon;
              return (
                <div key={q.id} className="p-5 hover:bg-secondary/20 transition-colors flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: p.bg }}
                      >
                        <Icon style={{ color: p.color }} className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[13px] font-semibold text-foreground">{q.author}</span>
                        <span className="text-[10px] text-muted-foreground">{q.subContext} · {q.time}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-medium bg-secondary text-muted-foreground rounded-md px-1.5 py-0 border-none">
                      {p.label}
                    </Badge>
                  </div>
                  <p className="text-[15px] text-foreground leading-relaxed font-medium">"{q.text}"</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <ArrowUp className="w-3 h-3" /> {q.engagement}
                    </span>
                    <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 font-medium border-border/50 text-muted-foreground">
                      {q.tag}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Mentions Over Time
   ============================================================ */
const mentionsAll = [
  { date: "May 5",  meal: 95,  ai: 22,  macro: 60 },
  { date: "May 8",  meal: 110, ai: 30,  macro: 65 },
  { date: "May 12", meal: 120, ai: 40,  macro: 80 },
  { date: "May 14", meal: 132, ai: 55,  macro: 85 },
  { date: "May 16", meal: 140, ai: 80,  macro: 75 },
  { date: "May 18", meal: 125, ai: 110, macro: 90 },
  { date: "May 20", meal: 150, ai: 135, macro: 85 },
  { date: "May 22", meal: 170, ai: 150, macro: 95 },
  { date: "May 24", meal: 185, ai: 190, macro: 100 },
  { date: "May 26", meal: 210, ai: 220, macro: 110 },
];

export function MentionsPage() {
  const total = mentionsAll.reduce((s, d) => s + d.meal + d.ai + d.macro, 0);
  return (
    <DetailLayout
      title="Mentions Over Time"
      description="Daily mention volume by theme across all monitored sources."
      actions={
        <>
          <DetailToolbarButton>Last 30 days</DetailToolbarButton>
          <DetailToolbarButton>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </DetailToolbarButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total mentions</p>
            <p className="text-3xl font-bold text-foreground mt-1">{total.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">+18.4% vs prior period</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Fastest growing theme</p>
            <p className="text-3xl font-bold text-foreground mt-1">AI accuracy</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">+312% in 21 days</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Peak day</p>
            <p className="text-3xl font-bold text-foreground mt-1">May 26</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">540 mentions</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
          <CardTitle className="text-[14px] font-semibold">Daily volume by theme</CardTitle>
        </CardHeader>
        <CardContent className="p-5 h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mentionsAll} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" name="Meal logging" dataKey="meal" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" name="AI calorie accuracy" dataKey="ai" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" name="Macro tracking" dataKey="macro" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Themes
   ============================================================ */
const themesAll = [
  { name: "Meal Logging", value: 28400, percentage: 100 },
  { name: "AI Workouts", value: 18200, percentage: 64 },
  { name: "Macro Tracking", value: 15400, percentage: 54 },
  { name: "Nutrition Plans", value: 9800, percentage: 34 },
  { name: "Consistency", value: 6200, percentage: 21 },
  { name: "Pricing & Paywalls", value: 5400, percentage: 19 },
  { name: "Apple Health Sync", value: 4100, percentage: 14 },
  { name: "Recipe Imports", value: 3300, percentage: 11 },
  { name: "Streaks", value: 2900, percentage: 10 },
  { name: "Onboarding", value: 1800, percentage: 6 },
];

export function ThemesPage() {
  return (
    <DetailLayout
      title="Top Themes by Volume"
      description="Mention volume grouped by theme over the last 30 days."
      actions={<DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px] lg:col-span-2">
          <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
            <CardTitle className="text-[14px] font-semibold">All themes</CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-4">
            {themesAll.map((t, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-foreground">{t.name}</span>
                  <span className="text-muted-foreground">{(t.value/1000).toFixed(1)}K</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${t.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
            <CardTitle className="text-[14px] font-semibold">Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={themesAll} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '11px' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DetailLayout>
  );
}

/* ============================================================
   Platforms
   ============================================================ */
const platformsAll = [
  { name: "Reddit",      value: 62100, percentage: "48.2%", fill: "#ff4500", growth: "+22%" },
  { name: "TikTok",      value: 30400, percentage: "23.7%", fill: "#000000", growth: "+38%" },
  { name: "X (Twitter)", value: 19700, percentage: "14.1%", fill: "#1da1f2", growth: "+8%" },
  { name: "YouTube",     value: 9100,  percentage: "7.1%",  fill: "#ff0000", growth: "+12%" },
  { name: "Instagram",   value: 5800,  percentage: "4.5%",  fill: "#e1306c", growth: "+5%" },
  { name: "Others",      value: 2600,  percentage: "2.4%",  fill: "#9ca3af", growth: "+1%" },
];

export function PlatformsPage() {
  return (
    <DetailLayout
      title="Platform Breakdown"
      description="Where your customers are talking — share of voice across all monitored platforms."
      actions={<DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px] lg:col-span-1">
          <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
            <CardTitle className="text-[14px] font-semibold">Share of voice</CardTitle>
          </CardHeader>
          <CardContent className="p-5 h-[360px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformsAll} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                  {platformsAll.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[28px] font-bold text-foreground leading-none">129.7K</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-1">Total Mentions</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px] lg:col-span-2">
          <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
            <CardTitle className="text-[14px] font-semibold">Per-platform detail</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/40">
              {platformsAll.map((p, i) => (
                <li key={i} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: p.fill }} />
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-muted-foreground font-medium">{p.value.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-medium w-12 text-right">{p.percentage}</span>
                    <span className="text-xs text-emerald-600 font-semibold w-12 text-right">{p.growth}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DetailLayout>
  );
}

/* ============================================================
   Content Ideas
   ============================================================ */
const tweetIdeas = [
  "Most fitness apps are built for accountants, not normal people. We don't want to calculate the macro split of a mixed salad. We just want to know if we're on track.",
  "The fitness industry's biggest lie: 'Tracking is easy if you build the habit'. No, tracking is hard because the software requires 8 taps to log a banana.",
  "Reminder: 42% of fitness app users churn within 7 days. The problem isn't motivation. It's onboarding length.",
  "Streaks are addictive, not motivating. The apps that retire them will win the long-game cohort.",
  "If your AI thinks chicken breast is a potato, you don't have an AI feature — you have a liability.",
];
const threadIdeas = [
  "1/ The biggest fitness apps are slowly becoming subscription mazes. Here's the data — and the apps quietly winning by going the other way.",
  "1/ I read 1,200 reviews of MyFitnessPal this month. 78% of complaints were about ONE feature decision. Here's the breakdown.",
  "1/ AI calorie estimation is 4 years away from being trustworthy. Here's what we measured and what users actually said.",
];

export function ContentIdeasPage() {
  return (
    <DetailLayout
      title="Content Ideas"
      description="Generated drafts based on this week's trending pain points and viral angles. Copy, edit, post."
      actions={
        <>
          <DetailToolbarButton><Bookmark className="w-3.5 h-3.5 mr-1.5" /> Saved</DetailToolbarButton>
          <Button size="sm" className="h-9 text-xs font-semibold bg-[#7c3aed] hover:bg-[#6d28d9]">Generate More</Button>
        </>
      }
    >
      <Tabs defaultValue="tweets" className="flex flex-col">
        <TabsList className="grid w-fit grid-cols-4 h-9 mb-4 bg-secondary/50 p-1">
          <TabsTrigger value="tweets" className="text-xs px-4">Tweets</TabsTrigger>
          <TabsTrigger value="threads" className="text-xs px-4">Threads</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs px-4">Charts</TabsTrigger>
          <TabsTrigger value="carousels" className="text-xs px-4">Carousels</TabsTrigger>
        </TabsList>
        <TabsContent value="tweets" className="flex flex-col gap-3 mt-0">
          {tweetIdeas.map((t, i) => (
            <Card key={i} className="shadow-none border-[#E5E7EB] rounded-[12px]">
              <CardContent className="p-5 flex items-start gap-4">
                <p className="text-[14px] text-foreground leading-relaxed flex-1">"{t}"</p>
                <div className="flex gap-1">
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"><Copy className="w-4 h-4" /></button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"><Share2 className="w-4 h-4" /></button>
                  <button className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md"><Bookmark className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="threads" className="flex flex-col gap-3 mt-0">
          {threadIdeas.map((t, i) => (
            <Card key={i} className="shadow-none border-[#E5E7EB] rounded-[12px]">
              <CardContent className="p-5 flex items-start gap-4">
                <p className="text-[14px] text-foreground leading-relaxed flex-1">{t}</p>
                <div className="flex gap-1">
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"><Copy className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="charts"><p className="text-sm text-muted-foreground p-8">Chart drafts coming soon.</p></TabsContent>
        <TabsContent value="carousels"><p className="text-sm text-muted-foreground p-8">Carousel drafts coming soon.</p></TabsContent>
      </Tabs>
    </DetailLayout>
  );
}

/* ============================================================
   Subreddits
   ============================================================ */
const subredditsAll = [
  { name: "r/loseit",        mentions: "12.4k", growth: "+26%", trend: "up" as const,   members: "4.2M" },
  { name: "r/xxfitness",     mentions: "8.2k",  growth: "+12%", trend: "up" as const,   members: "780K" },
  { name: "r/MyFitnessPal",  mentions: "4.1k",  growth: "-8%",  trend: "down" as const, members: "62K" },
  { name: "r/MacroFactor",   mentions: "3.8k",  growth: "+42%", trend: "up" as const,   members: "48K" },
  { name: "r/nutrition",     mentions: "2.9k",  growth: "0%",   trend: "flat" as const, members: "1.6M" },
  { name: "r/EatCheapAndHealthy", mentions: "2.1k", growth: "+9%", trend: "up" as const, members: "2.0M" },
  { name: "r/intermittentfasting", mentions: "1.8k", growth: "+3%", trend: "up" as const, members: "1.1M" },
  { name: "r/leangains",     mentions: "1.4k", growth: "+18%", trend: "up" as const,   members: "210K" },
];

export function SubredditsPage() {
  return (
    <DetailLayout
      title="Top Subreddits by Activity"
      description="Where your audience is hanging out on Reddit, ranked by mention volume."
      actions={<DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>}
    >
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {subredditsAll.map((s, i) => (
              <li key={i} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FFF1EC" }}>
                    <SiReddit className="w-4 h-4" style={{ color: "#FF4500" }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.members} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-foreground font-medium">{s.mentions} mentions</span>
                  <div className={`flex items-center gap-1 text-xs font-bold w-16 justify-end ${
                    s.trend === 'up' ? 'text-emerald-600' :
                    s.trend === 'down' ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {s.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : s.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                    {s.growth}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Sentiment
   ============================================================ */
const sentimentFull = [
  { date: "May 5",  pos: 38, neu: 50, neg: 12 },
  { date: "May 8",  pos: 35, neu: 50, neg: 15 },
  { date: "May 12", pos: 30, neu: 50, neg: 20 },
  { date: "May 14", pos: 32, neu: 48, neg: 22 },
  { date: "May 16", pos: 28, neu: 45, neg: 35 },
  { date: "May 18", pos: 25, neu: 40, neg: 45 },
  { date: "May 20", pos: 22, neu: 38, neg: 55 },
  { date: "May 22", pos: 20, neu: 35, neg: 60 },
  { date: "May 24", pos: 18, neu: 30, neg: 65 },
  { date: "May 26", pos: 16, neu: 28, neg: 70 },
];

export function SentimentPage() {
  return (
    <DetailLayout
      title="Sentiment Trend"
      description="Daily sentiment breakdown across all monitored competitors."
      actions={<DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Positive</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">16%</p>
            <p className="text-xs text-red-500 font-semibold mt-1">-22 pts vs prior</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Neutral</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">28%</p>
            <p className="text-xs text-red-500 font-semibold mt-1">-22 pts vs prior</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Negative</p>
            <p className="text-3xl font-bold text-red-500 mt-1">70%</p>
            <p className="text-xs text-red-500 font-semibold mt-1">+58 pts vs prior</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40">
          <CardTitle className="text-[14px] font-semibold">Sentiment over time</CardTitle>
        </CardHeader>
        <CardContent className="p-5 h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentFull} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '11px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" stackId="1" dataKey="pos" stroke="#10b981" fill="#10b981" fillOpacity={0.35} strokeWidth={2} name="Positive" />
              <Area type="monotone" stackId="1" dataKey="neu" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} strokeWidth={2} name="Neutral" />
              <Area type="monotone" stackId="1" dataKey="neg" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} strokeWidth={2} name="Negative" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Competitors
   ============================================================ */
const competitorsAll = [
  { name: "MyFitnessPal", mentions: "8.2k", sentiment: "Negative", complaint: "Paywalled scanner", price: "$19.99/mo", users: "200M+" },
  { name: "Cronometer",   mentions: "4.1k", sentiment: "Neutral",  complaint: "Clunky UI", price: "$9.99/mo", users: "5M" },
  { name: "Lose It!",     mentions: "3.8k", sentiment: "Positive", complaint: "Ads too aggressive", price: "$39.99/yr", users: "40M" },
  { name: "Yazio",        mentions: "2.4k", sentiment: "Neutral",  complaint: "Recipe database weak", price: "$33.99/yr", users: "60M" },
  { name: "FatSecret",    mentions: "1.2k", sentiment: "Neutral",  complaint: "Outdated design", price: "Free", users: "50M" },
  { name: "MacroFactor",  mentions: "1.0k", sentiment: "Positive", complaint: "Steep learning curve", price: "$11.99/mo", users: "1M" },
  { name: "Carb Manager", mentions: "780",  sentiment: "Positive", complaint: "Keto-only focus", price: "$39.99/yr", users: "8M" },
];

function sentimentBadge(s: string) {
  if (s === "Positive") return "text-[#059669] bg-[#D1FAE5]";
  if (s === "Negative") return "text-[#B91C1C] bg-[#FEE2E2]";
  return "text-[#B45309] bg-[#FEF3C7]";
}

export function CompetitorsPage() {
  return (
    <DetailLayout
      title="Competitor Watch"
      description="How the field is performing — mention volume, sentiment, and the loudest complaint about each app."
      actions={
        <>
          <ToolbarSearch placeholder="Search competitors…" />
          <DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>
        </>
      }
    >
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Competitor</div>
            <div className="col-span-2">Mentions</div>
            <div className="col-span-2">Sentiment</div>
            <div className="col-span-3">Top complaint</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1 text-right">Users</div>
          </div>
          <ul className="divide-y divide-border/40">
            {competitorsAll.map((c, i) => (
              <li key={i} className="px-5 py-4 grid grid-cols-12 items-center hover:bg-secondary/20 transition-colors">
                <div className="col-span-3 text-sm font-bold text-foreground">{c.name}</div>
                <div className="col-span-2 text-xs text-muted-foreground font-medium">{c.mentions}</div>
                <div className="col-span-2">
                  <Badge className={`text-[10px] uppercase px-2 py-0.5 h-5 font-bold border-none ${sentimentBadge(c.sentiment)}`}>
                    {c.sentiment}
                  </Badge>
                </div>
                <div className="col-span-3 text-xs text-muted-foreground italic truncate">{c.complaint}</div>
                <div className="col-span-1 text-xs text-foreground font-medium">{c.price}</div>
                <div className="col-span-1 text-xs text-muted-foreground text-right">{c.users}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}

/* ============================================================
   Saved
   ============================================================ */
const savedAll = [
  { title: "Users will switch apps immediately if barcode scanning is paywalled.", time: "2 hours ago", category: "Pricing" },
  { title: "AI food estimation is viewed as a gimmick, not a core feature yet.", time: "5 hours ago", category: "AI" },
  { title: "European users heavily prefer Yazio, indicating a localized marketing gap.", time: "1 day ago", category: "Geo" },
  { title: "Streaks are the #1 retention driver but also the #1 churn trigger when broken.", time: "2 days ago", category: "Retention" },
  { title: "Onboarding length is the strongest predictor of D7 churn — keep it under 90 seconds.", time: "3 days ago", category: "Onboarding" },
  { title: "Reddit complaints lead app store complaints by 2-3 weeks. It's an early warning system.", time: "4 days ago", category: "Methodology" },
];

export function SavedPage() {
  return (
    <DetailLayout
      title="Saved Insights"
      description="The conclusions your team flagged worth keeping — synthesised from this week's signal."
      actions={<DetailToolbarButton><Download className="w-3.5 h-3.5 mr-1.5" /> Export</DetailToolbarButton>}
    >
      <Card className="shadow-none border-[#E5E7EB] rounded-[12px]">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {savedAll.map((s, i) => (
              <div key={i} className="p-5 hover:bg-secondary/20 transition-colors flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-[14px] font-semibold text-foreground leading-snug">{s.title}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground font-medium">{s.time}</span>
                    <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 font-medium border-border/50 text-muted-foreground">
                      {s.category}
                    </Badge>
                  </div>
                </div>
                <button className="text-primary mt-0.5">
                  <Bookmark className="w-4 h-4 fill-primary" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DetailLayout>
  );
}
