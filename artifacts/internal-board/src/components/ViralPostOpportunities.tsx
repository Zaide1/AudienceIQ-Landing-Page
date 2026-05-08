import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { SiReddit, SiX, SiTiktok } from "react-icons/si";
import { FaLinkedinIn as SiLinkedin } from "react-icons/fa";
import type { IconType } from "react-icons";

type PlatformKey = "x" | "linkedin" | "reddit" | "tiktok";

const PLATFORMS: Record<
  PlatformKey,
  { label: string; Icon: IconType; color: string; bg: string; hoverBg: string }
> = {
  x:        { label: "Post on X",          Icon: SiX,        color: "#0F1419", bg: "#F1F2F4", hoverBg: "#0F1419" },
  linkedin: { label: "Post on LinkedIn",   Icon: SiLinkedin, color: "#0A66C2", bg: "#E8F2FB", hoverBg: "#0A66C2" },
  reddit:   { label: "Post on Reddit",     Icon: SiReddit,   color: "#FF4500", bg: "#FFF1EC", hoverBg: "#FF4500" },
  tiktok:   { label: "Post on TikTok",     Icon: SiTiktok,   color: "#000000", bg: "#F1F2F4", hoverBg: "#000000" },
};

const opportunities: Array<{
  id: number;
  angle: string;
  potential: string;
  type: string;
  platforms: PlatformKey[];
}> = [
  {
    id: 1,
    angle: "People don't want accurate calorie tracking — they want frictionless logging.",
    potential: "Very High Potential",
    type: "CONTRARIAN",
    platforms: ["x", "linkedin", "reddit"],
  },
  {
    id: 2,
    angle: "MyFitnessPal's barcode scanner being paywalled is the single biggest churn driver in fitness tech right now.",
    potential: "High Potential",
    type: "OBSERVATION",
    platforms: ["x", "linkedin", "reddit"],
  },
  {
    id: 3,
    angle: "We're moving from 'tracking macros' to 'AI estimating portions from a photo'. The gap is still trust.",
    potential: "Medium Potential",
    type: "TREND",
    platforms: ["x", "linkedin", "tiktok"],
  },
];

function buildPostUrl(platform: PlatformKey, text: string): string {
  const t = encodeURIComponent(text);
  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://audienceiq.app")}&summary=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?title=${t}`;
    case "tiktok":
      return `https://www.tiktok.com/upload?lang=en`;
  }
}

export function ViralPostOpportunities() {
  return (
    <Card className="shadow-none border-[#E5E7EB] rounded-[12px] h-full flex flex-col bg-[#faf5ff]/40">
      <CardHeader className="pb-3 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-primary">
          Viral Post Opportunities
        </CardTitle>
        <Link href="/viral-opportunities" className="text-xs text-primary font-medium hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-border/40">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 hover:bg-white/60 transition-colors flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {opp.type}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium bg-[#f3e8ff] text-primary hover:bg-[#f3e8ff]/80 border-none px-2 py-0.5 rounded-full"
                >
                  {opp.potential}
                </Badge>
              </div>
              <p className="text-[13px] font-medium text-foreground leading-snug">"{opp.angle}"</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] font-medium text-muted-foreground">Post to</span>
                <div className="flex gap-1.5">
                  {opp.platforms.map((key) => {
                    const p = PLATFORMS[key];
                    const Icon = p.Icon;
                    return (
                      <a
                        key={key}
                        href={buildPostUrl(key, opp.angle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={p.label}
                        aria-label={p.label}
                        className="group inline-flex items-center justify-center w-7 h-7 rounded-md border border-border/60 transition-all duration-150 hover:scale-105"
                        style={{ background: p.bg }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = p.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = p.bg;
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5 transition-colors"
                          style={{ color: p.color }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as unknown as HTMLElement).style.color = "#FFFFFF";
                          }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
