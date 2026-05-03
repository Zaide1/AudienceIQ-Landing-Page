/* ─── AudienceMapResult — shared frontend data contract ─────────── */

export interface SegmentEvidence {
  signalStrength: "Low" | "Medium" | "High";
  exampleUserLanguage: string[];
  likelySearchQueries: string[];
  competitorMentions: string[];
  unmetNeeds: string[];
  objections: string[];
}

export interface EvidenceSummary {
  sourceMode: "mock" | "ai_hypothesis" | "live_research";
  confidenceReason: string;
  totalSignals: number;
  strongestSignals: string[];
  limitations: string[];
  sourcesUsed?: string[];
}

export interface CompetitorItem {
  name: string;
  type: "direct" | "adjacent" | "substitute";
  whyRelevant: string;
  targetOverlap: string;
  weaknessToExploit: string;
  confidence: "low" | "medium" | "high";
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface CompetitorIntelligence {
  direct: CompetitorItem[];
  adjacent: CompetitorItem[];
  substitutes: CompetitorItem[];
  notes: string;
}

export interface ResearchSignal {
  id: string;
  source: "hacker_news" | "web" | "competitor_site" | "youtube" | "review_site" | "manual";
  query: string;
  title: string;
  snippet: string;
  url?: string;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  signalType: "pain_point" | "competitor" | "objection" | "unmet_need" | "language" | "channel";
  segmentId?: string;
  createdAt: string;
}

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
  evidence?: SegmentEvidence;
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
  evidenceSummary?: EvidenceSummary;
  competitors?: CompetitorIntelligence;
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

/* Generic, category-agnostic template used as the fallback for unknown or
   custom ("Other") categories. Previously the fallback was the health-fitness
   template, which caused unrelated products (e.g. a perfume TikTok page) to
   render Gym Goers / Busy Professionals / Health Conscious segments — a
   cross-product bleed users notice immediately. Names here are deliberately
   neutral so they read sensibly for any product. */
const GENERIC_TEMPLATE: SegmentTemplate[] = [
  {
    id: "gym",
    name: "Early Adopters",
    percent: 25,
    color: "purple",
    painPoints: ["Want to try new tools first", "Frustrated by current solutions"],
    platforms: ["X", "Reddit", "TikTok"],
    whyThisSegment: "Curious users who give early traction and word-of-mouth.",
    acquisitionAngle: "Lead with what's new and different — give them bragging rights.",
  },
  {
    id: "busy",
    name: "Mainstream Buyers",
    percent: 30,
    color: "blue",
    painPoints: ["Too many options", "Want proven solutions"],
    platforms: ["Instagram", "Facebook", "YouTube"],
    whyThisSegment: "Largest segment once early adopters validate the product.",
    acquisitionAngle: "Lead with social proof and concrete outcomes.",
  },
  {
    id: "health",
    name: "Value Seekers",
    percent: 20,
    color: "green",
    painPoints: ["Price-sensitive", "Need clear ROI"],
    platforms: ["YouTube", "Reddit", "Google"],
    whyThisSegment: "Convert well when the value-for-money story is clear.",
    acquisitionAngle: "Show before/after savings or ROI in the first 30 seconds.",
  },
  {
    id: "weight",
    name: "Niche Power Users",
    percent: 15,
    color: "orange",
    painPoints: ["Existing tools too generic", "Need depth and customisation"],
    platforms: ["Reddit", "YouTube", "X"],
    whyThisSegment: "Vocal advocates if you build features they specifically need.",
    acquisitionAngle: "Showcase advanced features competitors don't offer.",
  },
  {
    id: "nutrition",
    name: "Casual Browsers",
    percent: 10,
    color: "pink",
    painPoints: ["Low commitment", "Easily distracted"],
    platforms: ["TikTok", "Instagram", "Pinterest"],
    whyThisSegment: "Wide reach, low conversion — but cheap to acquire at scale.",
    acquisitionAngle: "Hook with a 10-second demo that delivers instant value.",
  },
];

function getTemplate(categoryId: string): SegmentTemplate[] {
  if (TEMPLATES[categoryId]) return TEMPLATES[categoryId];
  const lower = (categoryId ?? "").toLowerCase();
  for (const key of Object.keys(TEMPLATES)) {
    if (lower && (lower.includes(key) || key.includes(lower))) return TEMPLATES[key];
  }
  /* Unknown / custom category — never silently fall back to fitness segments. */
  return GENERIC_TEMPLATE;
}

/* ─── Mock evidence helper ───────────────────────────────────────── */
function buildMockSegmentEvidence(painPoints: string[]): SegmentEvidence {
  return {
    signalStrength: "Medium",
    exampleUserLanguage: painPoints.slice(0, 3).map((p) => {
      const lower = p.charAt(0).toLowerCase() + p.slice(1);
      return `"I just ${lower.replace(/[.!?]$/, "")}"`;
    }),
    likelySearchQueries: painPoints.slice(0, 3).map((p) =>
      p.toLowerCase().replace(/['".,!?]/g, "").trim(),
    ),
    competitorMentions: [],
    unmetNeeds: painPoints,
    objections: [
      "Not sure this is better than what I already use",
      "Worried about the learning curve",
      "Price needs to justify switching",
    ],
  };
}

/* ─── Coverage estimate helper ───────────────────────────────────── */
export interface CoverageInput {
  category: string;
  productIdea?: string;
  targetUsers?: string;
  problem?: string;
  sourceMode?: "mock" | "ai_hypothesis" | "live_research";
  segments?: Array<{ percent: number }>;
}

export function calculateCoverageEstimate(input: CoverageInput): number {
  const { category, productIdea = "", targetUsers = "", problem = "", sourceMode, segments } = input;
  const cat = category.toLowerCase();

  let base: number;
  if (["saas", "software", "developer", "devtools", "b2b", "enterprise", "analytics", "productivity", "fintech"].some((k) => cat.includes(k))) {
    base = 14;
  } else if (["health", "fitness", "consumer", "ecommerce", "social", "lifestyle", "fashion", "food", "beauty"].some((k) => cat.includes(k))) {
    base = 7;
  } else if (["creator", "media", "content", "video", "podcast"].some((k) => cat.includes(k))) {
    base = 10;
  } else if (["education", "learning", "course", "training"].some((k) => cat.includes(k))) {
    base = 9;
  } else if (["finance", "investment", "banking", "insurance"].some((k) => cat.includes(k))) {
    base = 11;
  } else {
    base = 8;
  }

  const combinedLen = productIdea.trim().length + targetUsers.trim().length + problem.trim().length;
  if (combinedLen < 30) base -= 3;
  else if (combinedLen > 150) base += 2;

  if (targetUsers.trim().length > 15) base += 1;
  if (problem.trim().length > 15) base += 1;

  if (sourceMode === "live_research") base += 4;

  if (segments && segments.length > 0) {
    const maxPct = Math.max(...segments.map((s) => s.percent));
    if (maxPct >= 40) base -= 1;
  }

  return Math.min(28, Math.max(3, Math.round(base)));
}

export function recalculateCoverageFields(
  coveragePct: number,
  reachMin: number,
  reachMax: number,
): { coverage: { percent: number; people: number }; untapped: { percent: number; min: number; max: number } } {
  const pct = Math.min(28, Math.max(3, Math.round(coveragePct)));
  const people = Math.round(reachMin * pct / 100);
  const untappedPct = 100 - pct;
  return {
    coverage: { percent: pct, people },
    untapped: {
      percent: untappedPct,
      min:     Math.round(reachMin - people),
      max:     Math.round(reachMax * untappedPct / 100),
    },
  };
}

/* ─── Product-aware segment naming helper ────────────────────────
   Mirrors backend artifacts/api-server/src/lib/audienceAI.ts —
   keep both copies in sync. Derives 5 distinct segment names from raw
   onboarding inputs so the deterministic frontend fallback no longer
   reads like a fixed category template. */
const NAMING_STOPWORDS: Set<string> = new Set([
  "a","an","the","and","or","of","for","to","that","who","with","on","in","at","by","as","from","but","so",
  "is","are","am","be","was","were","being",
  "our","my","your","their","his","her","its","this","these","those","it","i","we","you","they","them",
  "app","apps","tool","tools","platform","platforms","website","site","service","product","products",
  "startup","startups","idea","ideas","business","company","companies",
  "build","building","make","making","want","wanting","need","needing","needs","wants",
  "help","helps","helping","using","use","uses","via","just","really","very","like","when",
  "people","users","customer","customers","user","some","any","more","less","one","two",
  "ai","new","best","better","good","great","easy","fast","simple",
  "find","finds","finding","get","gets","getting","do","does","doing","go","goes","going",
  "feature","features","page","pages","work","works","working",
]);

function extractNamingTokens(text: string | undefined, max = 8): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !NAMING_STOPWORDS.has(t))
    .slice(0, max);
}

function pickNamingPhrase(tokens: string[], n = 2): string {
  if (tokens.length === 0) return "";
  return tokens.slice(0, Math.min(n, tokens.length)).join(" ");
}

function namingTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function namingHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const NAMING_PAIN_VERBS = ["struggling with", "frustrated by", "tired of", "fed up with"];

export function deriveSegmentNames(
  input: { productIdea?: string; targetUsers?: string; problem?: string; goal?: string },
  fallbackNames: string[],
): string[] {
  const productTokens = extractNamingTokens(input.productIdea, 10);
  const userTokens    = extractNamingTokens(input.targetUsers, 8);
  const problemTokens = extractNamingTokens(input.problem, 8);
  const goalTokens    = extractNamingTokens(input.goal, 6);

  const totalSignal = productTokens.length + userTokens.length + problemTokens.length;
  if (totalSignal < 3) return fallbackNames;

  const subject     = pickNamingPhrase(userTokens, 2) || pickNamingPhrase(productTokens, 1) || "early users";
  const subjectAlt  = pickNamingPhrase(userTokens.slice(2), 2) || pickNamingPhrase(productTokens.slice(2, 4), 2) || subject;
  const domain      = pickNamingPhrase(productTokens.slice(0, 2), 2) || pickNamingPhrase(userTokens, 1) || "this space";
  const domain1     = pickNamingPhrase(productTokens.slice(0, 1), 1) || domain.split(" ")[0]!;
  const painPhrase  = pickNamingPhrase(problemTokens, 3) || pickNamingPhrase(productTokens.slice(2, 5), 2) || "manual workflows";
  const altWorkaround = pickNamingPhrase(productTokens.slice(2, 5), 2) || pickNamingPhrase(problemTokens.slice(1, 3), 2) || "spreadsheets and notes";
  const goalKw      = pickNamingPhrase(goalTokens, 2) || pickNamingPhrase(productTokens.slice(0, 2), 2) || domain;

  const seed = namingHash(`${input.productIdea ?? ""}|${input.targetUsers ?? ""}|${input.problem ?? ""}`);
  const painVerb = NAMING_PAIN_VERBS[seed % NAMING_PAIN_VERBS.length]!;

  const raw = [
    `${namingTitleCase(subject)} ${painVerb} ${painPhrase}`,
    `${namingTitleCase(subject)} stuck on ${altWorkaround}`,
    `Active ${domain1} researchers`,
    `${namingTitleCase(subjectAlt)} exploring ${domain}`,
    `Power users wanting better ${goalKw}`,
  ];

  return raw.map((n) => {
    const trimmed = n.replace(/\s+/g, " ").trim();
    return trimmed.length > 60 ? trimmed.slice(0, 57).trimEnd() + "…" : trimmed;
  });
}

/* ─── Mock generation ────────────────────────────────────────────── */
export function generateMockAudienceMap(ob: Record<string, string> | null): AudienceMapResult {
  const productIdea = ob?.productIdea ?? "Your product";
  const categoryId  = ob?.finalCategory ?? ob?.category ?? "health-fitness";
  const regionId    = ob?.finalRegion   ?? ob?.region   ?? "uk";

  const regionLabel = resolveRegion(regionId);
  const [reachMin, reachMax] = getReach(regionId);

  const coveragePct    = calculateCoverageEstimate({
    category:    categoryId,
    productIdea: ob?.productIdea,
    targetUsers: ob?.targetUsers,
    problem:     ob?.problem,
    sourceMode:  "mock",
  });
  const coveragePeople = Math.round(reachMin * (coveragePct / 100));
  const untappedPct    = 100 - coveragePct;
  const untappedMin    = Math.round(reachMin - coveragePeople);
  const untappedMax    = Math.round(reachMax  * (untappedPct / 100));

  const templates = getTemplate(categoryId);

  const fallbackNames = templates.map((t) => t.name);
  const derivedNames  = deriveSegmentNames(
    {
      productIdea: ob?.productIdea,
      targetUsers: ob?.targetUsers,
      problem:     ob?.problem,
      goal:        ob?.goal,
    },
    fallbackNames,
  );

  const segments: AudienceSegment[] = templates.map((t, i) => ({
    ...t,
    name: derivedNames[i] ?? t.name,
    audienceMin: Math.round(reachMin * (t.percent / 100)),
    audienceMax: Math.round(reachMax * (t.percent / 100)),
    evidence: buildMockSegmentEvidence(t.painPoints),
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
    evidenceSummary: {
      sourceMode: "mock",
      confidenceReason: "Directional estimate based on category and region benchmarks. No live data has been collected.",
      totalSignals: 0,
      strongestSignals: [],
      limitations: [
        "This is a directional MVP estimate.",
        "Live social and competitor data is not connected yet.",
        "Validate with real user conversations before making decisions.",
      ],
    },
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

  /* Pure function — caller decides when to persist. Removed implicit
     saveAudienceMap() side-effect to prevent stale-bleed when the mock
     is generated as an in-memory fallback (e.g. during a brief redirect). */
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
