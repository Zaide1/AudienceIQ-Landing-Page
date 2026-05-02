/* ─── AudienceMapResult — shared frontend data contract ─────────── */

export interface AudienceSegment {
  id: string;
  name: string;
  percent: number;
  audienceMin: number;
  audienceMax: number;
  color: "purple" | "blue" | "green" | "orange" | "pink";
  painPoints: string[];
  platforms: string[];
  whyThisSegment: string;
  acquisitionAngle: string;
}

export interface AudienceInsight {
  title: string;
  description: string;
}

export interface AudienceMapResult {
  productSummary: string;
  region: string;
  category: string;
  confidence: "Low" | "Medium" | "High";
  reachableAudience: {
    min: number;
    max: number;
    label: string;
  };
  coverage: {
    percent: number;
    people: number;
  };
  untapped: {
    percent: number;
    min: number;
    max: number;
  };
  segments: AudienceSegment[];
  insights: AudienceInsight[];
}

/* ─── Storage ────────────────────────────────────────────────────── */
const MAP_KEY = "audense-audience-map";

export function loadAudienceMap(): AudienceMapResult | null {
  try {
    const raw = localStorage.getItem(MAP_KEY);
    if (raw) return JSON.parse(raw) as AudienceMapResult;
  } catch {}
  return null;
}

export function saveAudienceMap(result: AudienceMapResult): void {
  try {
    localStorage.setItem(MAP_KEY, JSON.stringify(result));
  } catch {}
}

/* ─── Number formatting ──────────────────────────────────────────── */
export function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

/* ─── Region lookup ──────────────────────────────────────────────── */
const REGION_LABELS: Record<string, string> = {
  us: "United States",
  uk: "United Kingdom",
  ca: "Canada",
  au: "Australia",
  in: "India",
  de: "Germany",
  fr: "France",
};

function resolveRegion(raw: string): string {
  return REGION_LABELS[raw] ?? raw;
}

/* ─── Region audience size ranges ───────────────────────────────── */
const REGION_REACH: Record<string, [number, number]> = {
  us: [2_100_000, 3_500_000],
  uk: [850_000,   1_400_000],
  ca: [700_000,   1_200_000],
  au: [600_000,   1_000_000],
  in: [4_500_000, 8_000_000],
  de: [900_000,   1_500_000],
  fr: [850_000,   1_400_000],
};

function getReach(regionId: string): [number, number] {
  return REGION_REACH[regionId] ?? [500_000, 900_000];
}

/* ─── Category segment templates ────────────────────────────────── */
type SegmentTemplate = Omit<AudienceSegment, "audienceMin" | "audienceMax">;

const TEMPLATES: Record<string, SegmentTemplate[]> = {
  "health-fitness": [
    {
      id: "gym",
      name: "Gym Goers",
      percent: 25,
      color: "purple",
      painPoints: ["Tracking is tedious", "Forget to log meals"],
      platforms: ["Instagram", "TikTok", "YouTube"],
      whyThisSegment: "Already motivated; your app removes the biggest friction.",
      acquisitionAngle: "Highlight speed — log a meal in under 10 seconds.",
    },
    {
      id: "busy",
      name: "Busy Professionals",
      percent: 30,
      color: "blue",
      painPoints: ["No time to track", "Inconsistent routine"],
      platforms: ["LinkedIn", "X", "Reddit"],
      whyThisSegment: "Largest segment with high willingness to pay for time savings.",
      acquisitionAngle: "Lead with 'automated tracking, zero effort'.",
    },
    {
      id: "health",
      name: "Health Conscious",
      percent: 20,
      color: "green",
      painPoints: ["Want simplicity", "Hate manual input"],
      platforms: ["Instagram", "YouTube", "Facebook"],
      whyThisSegment: "High retention once they see accurate macro breakdowns.",
      acquisitionAngle: "Show a clean, uncluttered UI vs competitors.",
    },
    {
      id: "weight",
      name: "Weight Loss Beginners",
      percent: 15,
      color: "orange",
      painPoints: ["Don't know where to start", "Overwhelmed"],
      platforms: ["TikTok", "Instagram", "Reddit"],
      whyThisSegment: "Huge untapped segment — most apps are too complex for them.",
      acquisitionAngle: "Promise simplicity: 'Start tracking in 60 seconds'.",
    },
    {
      id: "nutrition",
      name: "Nutrition Optimisers",
      percent: 10,
      color: "pink",
      painPoints: ["Want advanced insights", "Need accuracy"],
      platforms: ["YouTube", "Reddit", "Google"],
      whyThisSegment: "Power users who drive word-of-mouth if you satisfy them.",
      acquisitionAngle: "Showcase macro precision and detailed food database.",
    },
  ],

  saas: [
    {
      id: "gym",
      name: "Startup Founders",
      percent: 20,
      color: "purple",
      painPoints: ["Too many tools", "Hard to measure ROI"],
      platforms: ["X", "LinkedIn", "Reddit"],
      whyThisSegment: "Early adopters who will give referrals if value is clear.",
      acquisitionAngle: "Lead with speed-to-value — first result in under 5 minutes.",
    },
    {
      id: "busy",
      name: "Product Managers",
      percent: 25,
      color: "blue",
      painPoints: ["Stakeholder alignment", "Too many meetings"],
      platforms: ["LinkedIn", "Slack", "Reddit"],
      whyThisSegment: "Largest buyer segment in SaaS with budget authority.",
      acquisitionAngle: "Show how it cuts weekly reporting time in half.",
    },
    {
      id: "health",
      name: "Dev Teams",
      percent: 25,
      color: "green",
      painPoints: ["Context switching", "Manual workflows"],
      platforms: ["Reddit", "X", "YouTube"],
      whyThisSegment: "Bottom-up adoption — devs push tools upward to management.",
      acquisitionAngle: "Free tier with generous limits; let the tool speak for itself.",
    },
    {
      id: "weight",
      name: "Enterprise Buyers",
      percent: 15,
      color: "orange",
      painPoints: ["Security concerns", "Integration complexity"],
      platforms: ["LinkedIn", "Google", "YouTube"],
      whyThisSegment: "High ACV; even one deal justifies the segment focus.",
      acquisitionAngle: "Lead with compliance badges and enterprise case studies.",
    },
    {
      id: "nutrition",
      name: "Indie Hackers",
      percent: 15,
      color: "pink",
      painPoints: ["Limited budget", "Need full automation"],
      platforms: ["X", "Reddit", "YouTube"],
      whyThisSegment: "Vocal community; can drive 10x organic reach if impressed.",
      acquisitionAngle: "Offer lifetime deal to seed community and testimonials.",
    },
  ],

  ecommerce: [
    {
      id: "gym",
      name: "Bargain Hunters",
      percent: 30,
      color: "purple",
      painPoints: ["Missing deals", "Inconsistent pricing"],
      platforms: ["Facebook", "TikTok", "Instagram"],
      whyThisSegment: "High volume, price-sensitive; need clear savings messaging.",
      acquisitionAngle: "Lead with 'Never miss a deal' and price-drop alerts.",
    },
    {
      id: "busy",
      name: "Fashion Enthusiasts",
      percent: 25,
      color: "blue",
      painPoints: ["Overwhelming choice", "Fast fashion guilt"],
      platforms: ["Instagram", "TikTok", "Pinterest"],
      whyThisSegment: "Trend-driven; will pay premium for curated discovery.",
      acquisitionAngle: "Personalised style recommendations they can't get elsewhere.",
    },
    {
      id: "health",
      name: "Tech Shoppers",
      percent: 20,
      color: "green",
      painPoints: ["Trust issues", "Long research cycles"],
      platforms: ["Reddit", "YouTube", "Google"],
      whyThisSegment: "Highly researched buyers; great reviews → high conversion.",
      acquisitionAngle: "Feature comparison tools and verified expert reviews.",
    },
    {
      id: "weight",
      name: "Gift Buyers",
      percent: 15,
      color: "orange",
      painPoints: ["Decision fatigue", "Delivery anxiety"],
      platforms: ["Facebook", "Instagram", "Google"],
      whyThisSegment: "Seasonal spike opportunity — high intent, time-pressured.",
      acquisitionAngle: "Guarantee arrival dates and offer gift-ready packaging.",
    },
    {
      id: "nutrition",
      name: "Eco-conscious Shoppers",
      percent: 10,
      color: "pink",
      painPoints: ["Hard to verify sustainability claims", "Premium pricing"],
      platforms: ["Instagram", "Reddit", "TikTok"],
      whyThisSegment: "Growing fast; willing to pay more for clear ethical proof.",
      acquisitionAngle: "Transparency-first: show carbon footprint per product.",
    },
  ],

  education: [
    {
      id: "gym",
      name: "University Students",
      percent: 30,
      color: "purple",
      painPoints: ["Overwhelmed by content volume", "Procrastination"],
      platforms: ["TikTok", "YouTube", "Reddit"],
      whyThisSegment: "Largest cohort; strong word-of-mouth within campus networks.",
      acquisitionAngle: "Highlight exam-mode and bite-sized study tools.",
    },
    {
      id: "busy",
      name: "Working Professionals",
      percent: 25,
      color: "blue",
      painPoints: ["No time to upskill", "Certificate credibility"],
      platforms: ["LinkedIn", "YouTube", "Google"],
      whyThisSegment: "High willingness to pay for career-advancing credentials.",
      acquisitionAngle: "Lead with '15 minutes a day' learning promise.",
    },
    {
      id: "health",
      name: "Career Changers",
      percent: 20,
      color: "green",
      painPoints: ["Fear of starting over", "Portfolio gaps"],
      platforms: ["LinkedIn", "Reddit", "YouTube"],
      whyThisSegment: "Highly motivated; completing a course is top priority.",
      acquisitionAngle: "Show success stories of people who switched careers.",
    },
    {
      id: "weight",
      name: "Parents",
      percent: 15,
      color: "orange",
      painPoints: ["Limited time", "Child engagement"],
      platforms: ["Facebook", "YouTube", "Instagram"],
      whyThisSegment: "Long LTV — if children love it, subscriptions renew yearly.",
      acquisitionAngle: "Safe, structured content with parental oversight features.",
    },
    {
      id: "nutrition",
      name: "Hobbyists",
      percent: 10,
      color: "pink",
      painPoints: ["Shallow content", "Community isolation"],
      platforms: ["YouTube", "Reddit", "Instagram"],
      whyThisSegment: "Passionate learners who write glowing reviews when engaged.",
      acquisitionAngle: "Offer deep-dive masterclasses and a community forum.",
    },
  ],

  finance: [
    {
      id: "gym",
      name: "Young Savers",
      percent: 25,
      color: "purple",
      painPoints: ["Don't know where to start", "Afraid of risk"],
      platforms: ["TikTok", "Instagram", "Reddit"],
      whyThisSegment: "Mobile-first, fastest-growing segment in personal finance.",
      acquisitionAngle: "Make investing feel accessible — 'Start with £5'.",
    },
    {
      id: "busy",
      name: "Retail Investors",
      percent: 25,
      color: "blue",
      painPoints: ["Information overload", "Emotional trading"],
      platforms: ["Reddit", "X", "YouTube"],
      whyThisSegment: "Highly engaged; seek tools that give them an edge.",
      acquisitionAngle: "Highlight data-driven insights vs gut-feel trading.",
    },
    {
      id: "health",
      name: "Small Business Owners",
      percent: 20,
      color: "green",
      painPoints: ["Cash flow visibility", "Tax complexity"],
      platforms: ["LinkedIn", "Facebook", "Google"],
      whyThisSegment: "High pain, high budget; willing to pay for time savings.",
      acquisitionAngle: "Show 'your accountant, automated' value proposition.",
    },
    {
      id: "weight",
      name: "Budget-conscious Families",
      percent: 20,
      color: "orange",
      painPoints: ["Overspending", "No savings habit"],
      platforms: ["Facebook", "Instagram", "YouTube"],
      whyThisSegment: "Large volume; sticky once budgeting habits are formed.",
      acquisitionAngle: "Celebrate wins — 'You saved £200 this month!'",
    },
    {
      id: "nutrition",
      name: "Debt Managers",
      percent: 10,
      color: "pink",
      painPoints: ["Shame around money", "Confusing repayment plans"],
      platforms: ["Reddit", "YouTube", "Google"],
      whyThisSegment: "Underserved with deep emotional motivation to improve.",
      acquisitionAngle: "Lead with empathy and a clear debt-free timeline tool.",
    },
  ],

  "creator-tools": [
    {
      id: "gym",
      name: "YouTubers",
      percent: 25,
      color: "purple",
      painPoints: ["Long production time", "Inconsistent upload schedule"],
      platforms: ["YouTube", "Instagram", "X"],
      whyThisSegment: "Large, aspirational audience willing to pay for growth tools.",
      acquisitionAngle: "Show time saved per video with a 30-second demo.",
    },
    {
      id: "busy",
      name: "Instagram Creators",
      percent: 25,
      color: "blue",
      painPoints: ["Algorithm unpredictability", "Content ideas drying up"],
      platforms: ["Instagram", "TikTok", "X"],
      whyThisSegment: "High churn from burnout — your tool can be their solution.",
      acquisitionAngle: "Promise a '30-day content calendar in 10 minutes'.",
    },
    {
      id: "health",
      name: "Newsletter Writers",
      percent: 20,
      color: "green",
      painPoints: ["Growing subscriber list", "Monetisation uncertainty"],
      platforms: ["X", "LinkedIn", "Reddit"],
      whyThisSegment: "Highly engaged community with strong tool-sharing culture.",
      acquisitionAngle: "Show how top newsletters grew using your features.",
    },
    {
      id: "weight",
      name: "Podcasters",
      percent: 15,
      color: "orange",
      painPoints: ["Post-production bottleneck", "Distribution complexity"],
      platforms: ["YouTube", "Reddit", "X"],
      whyThisSegment: "Fastest-growing creator format; still underserved by tooling.",
      acquisitionAngle: "One-click edit, transcript, and clip — all in one place.",
    },
    {
      id: "nutrition",
      name: "TikTok Creators",
      percent: 15,
      color: "pink",
      painPoints: ["Trend fatigue", "Cross-platform repurposing"],
      platforms: ["TikTok", "Instagram", "YouTube"],
      whyThisSegment: "Fastest adopters; strong influence on peer creators.",
      acquisitionAngle: "Repurpose one video into five pieces of content instantly.",
    },
  ],

  "consumer-apps": [
    {
      id: "gym",
      name: "Gen Z Adopters",
      percent: 25,
      color: "purple",
      painPoints: ["Short attention span", "Too many app notifications"],
      platforms: ["TikTok", "Instagram", "YouTube"],
      whyThisSegment: "Early adopters who generate viral word-of-mouth.",
      acquisitionAngle: "Lean into personality and aesthetic — looks matter.",
    },
    {
      id: "busy",
      name: "Millennial Professionals",
      percent: 30,
      color: "blue",
      painPoints: ["App overload", "No clear ROI on time spent"],
      platforms: ["Instagram", "LinkedIn", "X"],
      whyThisSegment: "Biggest spenders on apps; value convenience above all.",
      acquisitionAngle: "Show the concrete time saving vs their current routine.",
    },
    {
      id: "health",
      name: "Remote Workers",
      percent: 20,
      color: "green",
      painPoints: ["Isolation", "Work-life boundary blur"],
      platforms: ["Reddit", "X", "YouTube"],
      whyThisSegment: "High daily app usage; open to tools that improve their day.",
      acquisitionAngle: "Position as a 'daily ritual' that improves remote life.",
    },
    {
      id: "weight",
      name: "Parents",
      percent: 15,
      color: "orange",
      painPoints: ["No time", "Need family-friendly options"],
      platforms: ["Facebook", "Instagram", "YouTube"],
      whyThisSegment: "High LTV when the whole family adopts the app.",
      acquisitionAngle: "Family plan with shared features and parental controls.",
    },
    {
      id: "nutrition",
      name: "Lifelong Learners",
      percent: 10,
      color: "pink",
      painPoints: ["Content quality", "Lack of depth"],
      platforms: ["YouTube", "Reddit", "Google"],
      whyThisSegment: "Passionate advocates who leave detailed, helpful reviews.",
      acquisitionAngle: "Depth and quality as a differentiator — not another shallow app.",
    },
  ],
};

function getTemplate(categoryId: string): SegmentTemplate[] {
  if (TEMPLATES[categoryId]) return TEMPLATES[categoryId];
  const lower = categoryId.toLowerCase();
  for (const key of Object.keys(TEMPLATES)) {
    if (lower.includes(key) || key.includes(lower)) return TEMPLATES[key];
  }
  return TEMPLATES["health-fitness"];
}

/* ─── Mock generation ────────────────────────────────────────────── */
export function generateMockAudienceMap(ob: Record<string, string> | null): AudienceMapResult {
  const productIdea = ob?.productIdea ?? "Your product";
  const categoryId  = ob?.finalCategory ?? ob?.category ?? "health-fitness";
  const regionId    = ob?.finalRegion   ?? ob?.region   ?? "uk";

  const regionLabel = resolveRegion(regionId);
  const [reachMin, reachMax] = getReach(regionId);

  const coveragePct   = 7;
  const coveragePeople = Math.round(reachMin * (coveragePct / 100));
  const untappedPct   = 100 - coveragePct;
  const untappedMin   = Math.round(reachMin  * (untappedPct / 100));
  const untappedMax   = Math.round(reachMax  * (untappedPct / 100));

  const templates = getTemplate(categoryId);

  const segments: AudienceSegment[] = templates.map((t) => ({
    ...t,
    audienceMin: Math.round(reachMin * (t.percent / 100)),
    audienceMax: Math.round(reachMax * (t.percent / 100)),
  }));

  const categoryLabel = CATEGORY_LABELS[categoryId] ?? categoryId;

  const result: AudienceMapResult = {
    productSummary: productIdea,
    region:         regionLabel,
    category:       categoryLabel,
    confidence:     "Medium",
    reachableAudience: {
      min:   reachMin,
      max:   reachMax,
      label: `people in ${regionLabel}`,
    },
    coverage: {
      percent: coveragePct,
      people:  coveragePeople,
    },
    untapped: {
      percent: untappedPct,
      min:     untappedMin,
      max:     untappedMax,
    },
    segments,
    insights: [
      {
        title:       "Biggest opportunity",
        description: `${segments[1].name} is your largest segment at ${segments[1].percent}% — lean into ${segments[1].acquisitionAngle.toLowerCase()}`,
      },
      {
        title:       "Quick win",
        description: `${segments[0].name} are already motivated. ${segments[0].acquisitionAngle}`,
      },
      {
        title:       "Untapped upside",
        description: `${untappedPct}% of your reachable audience (~${formatK(untappedMin)} – ${formatK(untappedMax)} people) hasn't been reached yet.`,
      },
    ],
  };

  saveAudienceMap(result);
  return result;
}

const CATEGORY_LABELS: Record<string, string> = {
  "health-fitness":  "Health & Fitness",
  "saas":            "SaaS / Software",
  "ecommerce":       "E-commerce",
  "education":       "Education",
  "finance":         "Finance",
  "creator-tools":   "Creator Tools",
  "consumer-apps":   "Consumer Apps",
  "other":           "Other",
};
