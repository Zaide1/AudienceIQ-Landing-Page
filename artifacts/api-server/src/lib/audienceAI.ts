import OpenAI from "openai";
import {
  CATEGORY_LABELS,
  REGION_LABELS,
  REGION_REACH,
  resolveTemplate,
} from "./audienceTemplates";

const COLORS = ["purple", "blue", "green", "orange", "pink"] as const;
type Color = (typeof COLORS)[number];

/* ─── Evidence types (mirrors frontend) ─────────────────────────── */
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

/* ─── Result shape (mirrors frontend AudienceMapResult) ──────────── */
export interface AudienceSegment {
  id: string;
  name: string;
  percent: number;
  audienceMin: number;
  audienceMax: number;
  color: Color;
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
  reachableAudience: { min: number; max: number; label: string };
  coverage: { percent: number; people: number };
  untapped: { percent: number; min: number; max: number };
  segments: AudienceSegment[];
  insights: AudienceInsight[];
  evidenceSummary?: EvidenceSummary;
  competitors?: CompetitorIntelligence;
}

/* ─── Product-aware segment naming helper ────────────────────────
   Derives 5 distinct segment names from raw onboarding inputs so that
   the deterministic fallback no longer reads like a fixed category
   template. If signal is too thin, falls back to category-template
   names supplied by the caller. Mirrored verbatim in the frontend
   (artifacts/audense/src/lib/audienceMap.ts) — keep them in sync. */
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

/* ─── Competitor intelligence fallbacks by category ─────────────── */
const COMPETITOR_FALLBACKS: Record<string, CompetitorIntelligence> = {
  "health-fitness": {
    direct: [
      { name: "MyFitnessPal", type: "direct", whyRelevant: "Market-leading calorie and macro tracker", targetOverlap: "Gym goers and weight loss beginners", weaknessToExploit: "Complex UI, ad-heavy, large-corp feel — users want faster and cleaner", confidence: "medium" },
      { name: "Lose It!", type: "direct", whyRelevant: "Popular food diary with barcode scanning", targetOverlap: "Busy professionals tracking on the go", weaknessToExploit: "Key features paywalled, no real coaching or personalisation", confidence: "medium" },
      { name: "Cronometer", type: "direct", whyRelevant: "Micronutrient-focused tracker for power users", targetOverlap: "Nutrition optimisers seeking accuracy", weaknessToExploit: "Too complex for beginners, steep learning curve", confidence: "medium" },
    ],
    adjacent: [
      { name: "Strava", type: "adjacent", whyRelevant: "Fitness activity tracker many health-conscious users already use", targetOverlap: "Active gym goers and runners", weaknessToExploit: "Leaves a gap on nutrition — no meal tracking at all", confidence: "medium" },
      { name: "Apple Health", type: "adjacent", whyRelevant: "Built-in iOS health aggregator users already have", targetOverlap: "All iOS health-conscious users", weaknessToExploit: "Generic, non-actionable, no personalised guidance", confidence: "medium" },
    ],
    substitutes: [
      { name: "Notes app logging", type: "substitute", whyRelevant: "Many casual trackers write meals informally in Apple Notes or Reminders", targetOverlap: "Beginners not yet committed to a dedicated app", weaknessToExploit: "Zero structure, no feedback loop, habit breaks easily", confidence: "medium" },
      { name: "Meal photos", type: "substitute", whyRelevant: "Users photograph food instead of logging it", targetOverlap: "Overwhelmed beginners wanting zero-friction capture", weaknessToExploit: "No data extracted, no insight generated", confidence: "medium" },
      { name: "Spreadsheet tracking", type: "substitute", whyRelevant: "Data-minded users build custom calorie logs in Google Sheets", targetOverlap: "Nutrition optimisers wanting full control", weaknessToExploit: "High setup cost, no mobile UX, doesn't scale to daily habit", confidence: "low" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "saas": {
    direct: [
      { name: "Notion", type: "direct", whyRelevant: "All-in-one workspace used as catch-all productivity tool", targetOverlap: "Startup founders and indie hackers", weaknessToExploit: "Too generic — no opinionated workflow; users spend hours on templates", confidence: "medium" },
      { name: "Airtable", type: "direct", whyRelevant: "Database-as-spreadsheet for structured workflows", targetOverlap: "Product managers and operations teams", weaknessToExploit: "Steep learning curve for non-technical users; expensive at scale", confidence: "medium" },
      { name: "Monday.com", type: "direct", whyRelevant: "Work OS for project and task management", targetOverlap: "Enterprise buyers and team leads", weaknessToExploit: "Expensive, bloated with features most teams never use", confidence: "medium" },
    ],
    adjacent: [
      { name: "Linear", type: "adjacent", whyRelevant: "Developer-focused issue tracker competing for dev team attention", targetOverlap: "Dev teams and technical founders", weaknessToExploit: "Only serves dev workflows — leaves broader team coordination unsolved", confidence: "medium" },
      { name: "Zapier", type: "adjacent", whyRelevant: "Automation layer that touches every SaaS workflow", targetOverlap: "Indie hackers and ops-heavy teams", weaknessToExploit: "Complex setup, no intelligence — just rule-based triggers", confidence: "medium" },
    ],
    substitutes: [
      { name: "Email threads", type: "substitute", whyRelevant: "Default coordination tool before adopting SaaS", targetOverlap: "Enterprise buyers resistant to change", weaknessToExploit: "No structure, context is lost, decisions are hard to trace", confidence: "medium" },
      { name: "Shared Google Docs", type: "substitute", whyRelevant: "Teams use collaborative docs as lightweight wikis and trackers", targetOverlap: "Small teams and early-stage startups", weaknessToExploit: "No workflow, no accountability, becomes a graveyard of outdated docs", confidence: "medium" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "ecommerce": {
    direct: [
      { name: "Shopify", type: "direct", whyRelevant: "Dominant e-commerce platform for direct-to-consumer brands", targetOverlap: "Founders building online stores", weaknessToExploit: "Transaction fees and app costs stack up fast; not built for niche workflows", confidence: "medium" },
      { name: "WooCommerce", type: "direct", whyRelevant: "WordPress-based e-commerce plugin with large install base", targetOverlap: "Small businesses and WordPress users", weaknessToExploit: "Requires hosting and maintenance; feels fragile at scale", confidence: "medium" },
    ],
    adjacent: [
      { name: "Etsy", type: "adjacent", whyRelevant: "Marketplace platform for creators and niche goods sellers", targetOverlap: "Small creators and artisan sellers", weaknessToExploit: "No brand ownership — seller is always 'on Etsy', not their own brand", confidence: "medium" },
      { name: "Stripe", type: "adjacent", whyRelevant: "Payment infrastructure many e-commerce teams build on", targetOverlap: "Technical founders building custom checkout flows", weaknessToExploit: "Payments only — no storefront, discovery, or fulfilment layer", confidence: "medium" },
    ],
    substitutes: [
      { name: "Social media selling", type: "substitute", whyRelevant: "Founders sell via Instagram DMs or TikTok Shop before building a store", targetOverlap: "Early-stage creators monetising an audience", weaknessToExploit: "No inventory management, no data ownership, platform dependency risk", confidence: "medium" },
      { name: "Manual invoicing", type: "substitute", whyRelevant: "Service businesses send invoices manually before automating", targetOverlap: "B2B-focused early-stage businesses", weaknessToExploit: "Doesn't scale, error-prone, painful for recurring customers", confidence: "low" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "education": {
    direct: [
      { name: "Udemy", type: "direct", whyRelevant: "Marketplace for pre-recorded courses across all topics", targetOverlap: "Career changers and professionals upskilling", weaknessToExploit: "Constant discounting erodes perceived value; no community or mentorship", confidence: "medium" },
      { name: "Coursera", type: "direct", whyRelevant: "University-backed credential platform for professionals", targetOverlap: "Working professionals seeking recognised certifications", weaknessToExploit: "Expensive, passive video-only format, low completion rates", confidence: "medium" },
      { name: "Teachable", type: "direct", whyRelevant: "Course creation platform for independent instructors", targetOverlap: "Content creators and coaches selling knowledge", weaknessToExploit: "Platform fees, no built-in audience, creator does all marketing", confidence: "medium" },
    ],
    adjacent: [
      { name: "YouTube", type: "adjacent", whyRelevant: "Free video content competing for learner attention", targetOverlap: "Hobbyists and beginners exploring a new topic", weaknessToExploit: "No structure, no accountability, no certification, inconsistent quality", confidence: "medium" },
      { name: "Substack", type: "adjacent", whyRelevant: "Newsletter platform used by creators to monetise knowledge", targetOverlap: "Lifelong learners who prefer text-based content", weaknessToExploit: "Passive consumption — no exercises, no community, no feedback", confidence: "medium" },
    ],
    substitutes: [
      { name: "Physical textbooks", type: "substitute", whyRelevant: "Traditional study resource still used by students", targetOverlap: "University students and academic learners", weaknessToExploit: "Static, expensive, no interactivity or personalised feedback", confidence: "medium" },
      { name: "Peer study groups", type: "substitute", whyRelevant: "Group chats and Discord servers where learners help each other", targetOverlap: "Students seeking community and accountability", weaknessToExploit: "Inconsistent quality, no structured learning path", confidence: "low" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "finance": {
    direct: [
      { name: "YNAB", type: "direct", whyRelevant: "Popular budgeting app based on zero-based budgeting", targetOverlap: "Budget-conscious families and debt managers", weaknessToExploit: "Steep learning curve; subscription-only with no free tier", confidence: "medium" },
      { name: "Copilot", type: "direct", whyRelevant: "AI-powered personal finance app for iOS", targetOverlap: "Young savers and millennial professionals", weaknessToExploit: "iOS-only, US-focused, subscription cost adds up", confidence: "medium" },
      { name: "Revolut", type: "direct", whyRelevant: "Neobank with built-in budgeting and spending analytics", targetOverlap: "Young savers and retail investors", weaknessToExploit: "Banking-first; analytics are secondary and not actionable for serious budgeters", confidence: "medium" },
    ],
    adjacent: [
      { name: "Monzo", type: "adjacent", whyRelevant: "UK neobank with pots and spending categorisation", targetOverlap: "Young savers and budget-conscious families in the UK", weaknessToExploit: "Banking product, not budgeting — categories limited and not goal-oriented", confidence: "medium" },
      { name: "Plaid", type: "adjacent", whyRelevant: "Bank connectivity infrastructure many finance apps build on", targetOverlap: "Developers and fintech founders", weaknessToExploit: "Infrastructure only — no user-facing budgeting or advice layer", confidence: "medium" },
    ],
    substitutes: [
      { name: "Spreadsheet budgeting", type: "substitute", whyRelevant: "Classic approach — Google Sheets or Excel for expense tracking", targetOverlap: "Data-minded users and small business owners", weaknessToExploit: "Manual, error-prone, no real-time bank syncing, high maintenance", confidence: "medium" },
      { name: "Bank app review", type: "substitute", whyRelevant: "Many users scroll their bank app at month end to check spending", targetOverlap: "Casual money managers not ready for a dedicated app", weaknessToExploit: "Reactive, no planning, no trend analysis, no goal setting", confidence: "medium" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "creator-tools": {
    direct: [
      { name: "Buffer", type: "direct", whyRelevant: "Social media scheduling tool used by solo creators and small teams", targetOverlap: "Instagram creators and newsletter writers on multiple platforms", weaknessToExploit: "Limited analytics, no AI content generation, feels dated", confidence: "medium" },
      { name: "Hootsuite", type: "direct", whyRelevant: "Enterprise social media management platform", targetOverlap: "Larger creator teams and brands", weaknessToExploit: "Overpriced for solo creators; complex UI built for agencies", confidence: "medium" },
      { name: "Later", type: "direct", whyRelevant: "Visual-first scheduling tool popular with Instagram creators", targetOverlap: "Instagram and Pinterest creators", weaknessToExploit: "Weak on TikTok and LinkedIn; no content ideation features", confidence: "medium" },
    ],
    adjacent: [
      { name: "Canva", type: "adjacent", whyRelevant: "Design tool creators use for social media visuals", targetOverlap: "All creator types producing visual content", weaknessToExploit: "Design-only — no scheduling, analytics, or content strategy layer", confidence: "medium" },
      { name: "CapCut", type: "adjacent", whyRelevant: "Short-form video editor popular with TikTok and Reels creators", targetOverlap: "TikTok creators and video-first content producers", weaknessToExploit: "Editing-only — no planning, scheduling, or repurposing features", confidence: "medium" },
    ],
    substitutes: [
      { name: "Manual native posting", type: "substitute", whyRelevant: "Most creators post directly from each platform's app without a scheduler", targetOverlap: "Early-stage creators before needing workflow tools", weaknessToExploit: "No consistency, no analytics, platform-by-platform context switching", confidence: "medium" },
      { name: "Notes app drafting", type: "substitute", whyRelevant: "Creators draft posts and ideas in Apple Notes or Notion before publishing", targetOverlap: "Writers and newsletter creators managing content ideas", weaknessToExploit: "No publishing, no calendar, no collaboration layer", confidence: "medium" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
  "consumer-apps": {
    direct: [
      { name: "Duolingo", type: "direct", whyRelevant: "High-retention consumer app known for gamification and daily habits", targetOverlap: "Gen Z adopters and millennials building daily routines", weaknessToExploit: "Single-skill focus; gamification can feel hollow after initial novelty", confidence: "low" },
      { name: "Headspace", type: "direct", whyRelevant: "Popular consumer wellness app with strong brand and subscription model", targetOverlap: "Remote workers and millennial professionals seeking daily routines", weaknessToExploit: "Expensive subscription; passive consumption, not personalised", confidence: "low" },
    ],
    adjacent: [
      { name: "Apple Shortcuts", type: "adjacent", whyRelevant: "Built-in automation tool power users already have on iPhone", targetOverlap: "Remote workers and productivity-focused users", weaknessToExploit: "Requires technical setup; most users never configure it", confidence: "medium" },
      { name: "Zapier", type: "adjacent", whyRelevant: "Automation tool competing for the 'connect my life together' use case", targetOverlap: "Indie hackers and productivity users", weaknessToExploit: "Complex, web-focused, no mobile-first experience", confidence: "medium" },
    ],
    substitutes: [
      { name: "Manual habits and routines", type: "substitute", whyRelevant: "Users build their own system with alarms, sticky notes, and calendar events", targetOverlap: "All segments before app adoption", weaknessToExploit: "No feedback loop, no streak, no accountability — breaks under stress", confidence: "medium" },
      { name: "Browser bookmarks", type: "substitute", whyRelevant: "Common workaround for saving and organising things to return to", targetOverlap: "Remote workers and lifelong learners", weaknessToExploit: "Disorganised, poor cross-device sync, no resurface mechanism", confidence: "low" },
    ],
    notes: "Likely alternatives to compare against — not officially verified market data.",
  },
};

function getCompetitorFallback(categoryId: string): CompetitorIntelligence {
  if (COMPETITOR_FALLBACKS[categoryId]) return COMPETITOR_FALLBACKS[categoryId]!;
  const lower = categoryId.toLowerCase();
  for (const key of Object.keys(COMPETITOR_FALLBACKS)) {
    if (lower.includes(key) || key.includes(lower)) return COMPETITOR_FALLBACKS[key]!;
  }
  return COMPETITOR_FALLBACKS["saas"]!;
}

/* ─── Validate AI-generated competitor data ──────────────────────── */
function validateCompetitors(raw: unknown): CompetitorIntelligence | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const VALID_CONFIDENCE = ["low", "medium", "high"] as const;
  const VALID_TYPE = ["direct", "adjacent", "substitute"] as const;

  function validateItem(item: unknown): CompetitorItem | null {
    if (!item || typeof item !== "object") return null;
    const i = item as Record<string, unknown>;
    if (typeof i.name !== "string" || !i.name.trim()) return null;
    if (!VALID_TYPE.includes(i.type as typeof VALID_TYPE[number])) return null;
    if (typeof i.whyRelevant !== "string") return null;
    if (typeof i.targetOverlap !== "string") return null;
    if (typeof i.weaknessToExploit !== "string") return null;
    if (!VALID_CONFIDENCE.includes(i.confidence as typeof VALID_CONFIDENCE[number])) return null;
    const result: CompetitorItem = {
      name: i.name.trim(),
      type: i.type as CompetitorItem["type"],
      whyRelevant: i.whyRelevant,
      targetOverlap: i.targetOverlap,
      weaknessToExploit: i.weaknessToExploit,
      confidence: i.confidence as CompetitorItem["confidence"],
    };
    if (typeof i.sourceUrl === "string" && i.sourceUrl.startsWith("http")) result.sourceUrl = i.sourceUrl;
    if (typeof i.sourceLabel === "string") result.sourceLabel = i.sourceLabel;
    return result;
  }

  function validateList(arr: unknown, type: CompetitorItem["type"]): CompetitorItem[] {
    if (!Array.isArray(arr)) return [];
    return (arr as unknown[])
      .map((item) => {
        const v = validateItem(item);
        if (!v) return null;
        return { ...v, type };
      })
      .filter((x): x is CompetitorItem => x !== null);
  }

  const direct = validateList(r.direct, "direct");
  const adjacent = validateList(r.adjacent, "adjacent");
  const substitutes = validateList(r.substitutes, "substitute");

  if (direct.length + adjacent.length + substitutes.length === 0) return null;

  return {
    direct,
    adjacent,
    substitutes,
    notes: typeof r.notes === "string" ? r.notes : "Directional hypothesis — treat as likely alternatives to compare against.",
  };
}

/* ─── AI competitor generation ───────────────────────────────────── */
async function generateCompetitorsWithAI(
  client: OpenAI,
  params: {
    productIdea: string;
    targetUsers: string;
    problem: string;
    goal: string;
    category: string;
    region: string;
  },
): Promise<CompetitorIntelligence | null> {
  const { productIdea, targetUsers, problem, goal, category, region } = params;

  const prompt = `You are a competitive intelligence analyst for early-stage founders.
Identify named competitors and substitute behaviours for this product.
Use "likely" framing unless the product is in a well-known category.
Return ONLY valid JSON.

Product: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem: ${problem || "Not specified"}
Goal: ${goal || "Not specified"}
Category: ${category}
Region: ${region}

Return exactly this JSON shape:
{
  "direct": [
    {
      "name": "Real product name",
      "type": "direct",
      "whyRelevant": "Why this competes with the product above",
      "targetOverlap": "Which user segments overlap",
      "weaknessToExploit": "What positioning opportunity this creates",
      "confidence": "low"|"medium"|"high"
    }
  ],
  "adjacent": [ same shape ],
  "substitutes": [ same shape ],
  "notes": "1-sentence landscape summary"
}

Rules:
- direct: 2–4 products solving the same core job
- adjacent: 2–3 products competing for attention or part of the workflow
- substitutes: 2–3 manual workarounds or current user behaviours (not apps)
- confidence: "medium" for well-known categories, "low" if speculative
- Do NOT include sourceUrl — reserved for source-backed signals only
- Do NOT invent fake company names`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(7_000) },
    );
    const content = resp.choices[0]?.message?.content;
    if (!content) return null;
    const parsed: unknown = JSON.parse(content);
    return validateCompetitors(parsed);
  } catch {
    return null;
  }
}

/* ─── Coverage estimate helpers (mirrors frontend audienceMap.ts) ── */
interface CoverageInput {
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

/* ─── Build deterministic fallback ──────────────────────────────── */
export interface BuildMockInput {
  productIdea?: string;
  targetUsers?: string;
  problem?: string;
  goal?: string;
  finalCategory: string;
  finalRegion: string;
}

export function buildMockResult(input: BuildMockInput): AudienceMapResult {
  const { productIdea = "", targetUsers = "", problem = "", goal = "", finalCategory, finalRegion } = input;
  const regionLabel = REGION_LABELS[finalRegion] ?? finalRegion;
  const [reachMin, reachMax] = REGION_REACH[finalRegion] ?? [500_000, 900_000];
  const categoryLabel = CATEGORY_LABELS[finalCategory] ?? finalCategory;
  const templates = resolveTemplate(finalCategory);

  const coveragePct    = calculateCoverageEstimate({ category: finalCategory, productIdea, sourceMode: "mock" });
  const coveragePeople = Math.round(reachMin * (coveragePct / 100));
  const untappedPct    = 100 - coveragePct;

  const fallbackNames = templates.map((t) => t.name);
  const derivedNames  = deriveSegmentNames({ productIdea, targetUsers, problem, goal }, fallbackNames);

  const segments: AudienceSegment[] = templates.map((t, i) => ({
    id: t.id,
    name: derivedNames[i] ?? t.name,
    percent: t.percent,
    audienceMin: Math.round(reachMin * (t.percent / 100)),
    audienceMax: Math.round(reachMax * (t.percent / 100)),
    color: t.color,
    painPoints: t.painPoints,
    platforms: t.platforms,
    whyThisSegment: t.whyThisSegment,
    acquisitionAngle: t.acquisitionAngle,
    evidence: buildMockSegmentEvidence(t.painPoints),
  }));

  return {
    productSummary: productIdea || "Your product",
    region: regionLabel,
    category: categoryLabel,
    confidence: "Medium",
    reachableAudience: { min: reachMin, max: reachMax, label: `people in ${regionLabel}` },
    coverage: { percent: coveragePct, people: coveragePeople },
    untapped: {
      percent: untappedPct,
      min: Math.round(reachMin - coveragePeople),
      max: Math.round(reachMax * (untappedPct / 100)),
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
    competitors: getCompetitorFallback(finalCategory),
    insights: [
      {
        title: "Biggest opportunity",
        description: `${segments[1]!.name} is your largest segment at ${segments[1]!.percent}% — lean into ${segments[1]!.acquisitionAngle.toLowerCase()}`,
      },
      {
        title: "Quick win",
        description: `${segments[0]!.name} are already motivated. ${segments[0]!.acquisitionAngle}`,
      },
      {
        title: "Untapped upside",
        description: `${untappedPct}% of your reachable audience hasn't been reached yet.`,
      },
    ],
  };
}

/* ─── Validate AI-returned JSON ─────────────────────────────────── */
function validateResult(raw: unknown): AudienceMapResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.productSummary !== "string") return null;
  if (typeof r.region !== "string") return null;
  if (typeof r.category !== "string") return null;
  if (!["Low", "Medium", "High"].includes(r.confidence as string)) return null;

  const ra = r.reachableAudience as Record<string, unknown>;
  if (!ra || typeof ra.min !== "number" || typeof ra.max !== "number" || typeof ra.label !== "string") return null;

  const cov = r.coverage as Record<string, unknown>;
  if (!cov || typeof cov.percent !== "number" || typeof cov.people !== "number") return null;

  const unt = r.untapped as Record<string, unknown>;
  if (!unt || typeof unt.percent !== "number" || typeof unt.min !== "number" || typeof unt.max !== "number") return null;

  if (!Array.isArray(r.segments) || r.segments.length !== 5) return null;
  if (!Array.isArray(r.insights) || r.insights.length !== 3) return null;

  /* Validate segments */
  const segments: AudienceSegment[] = [];
  let pctSum = 0;
  for (let i = 0; i < 5; i++) {
    const s = r.segments[i] as Record<string, unknown>;
    if (!s || typeof s.id !== "string" || typeof s.name !== "string") return null;
    if (typeof s.percent !== "number" || typeof s.audienceMin !== "number" || typeof s.audienceMax !== "number") return null;
    if (!Array.isArray(s.painPoints) || !Array.isArray(s.platforms)) return null;
    if (typeof s.whyThisSegment !== "string" || typeof s.acquisitionAngle !== "string") return null;
    pctSum += s.percent;

    /* Optionally extract evidence if AI provided it */
    let evidence: SegmentEvidence | undefined;
    const ev = s.evidence as Record<string, unknown> | undefined;
    if (ev && Array.isArray(ev.exampleUserLanguage) && Array.isArray(ev.unmetNeeds) && Array.isArray(ev.objections)) {
      evidence = {
        signalStrength: (["Low", "Medium", "High"] as const).includes(ev.signalStrength as "Low" | "Medium" | "High")
          ? ev.signalStrength as "Low" | "Medium" | "High"
          : "Medium",
        exampleUserLanguage: (ev.exampleUserLanguage as unknown[]).filter((x): x is string => typeof x === "string"),
        likelySearchQueries: Array.isArray(ev.likelySearchQueries)
          ? (ev.likelySearchQueries as unknown[]).filter((x): x is string => typeof x === "string")
          : [],
        competitorMentions: Array.isArray(ev.competitorMentions)
          ? (ev.competitorMentions as unknown[]).filter((x): x is string => typeof x === "string")
          : [],
        unmetNeeds: (ev.unmetNeeds as unknown[]).filter((x): x is string => typeof x === "string"),
        objections: (ev.objections as unknown[]).filter((x): x is string => typeof x === "string"),
      };
    }

    segments.push({
      id: s.id,
      name: s.name,
      percent: s.percent,
      audienceMin: s.audienceMin,
      audienceMax: s.audienceMax,
      color: COLORS[i]!,
      painPoints: s.painPoints as string[],
      platforms: s.platforms as string[],
      whyThisSegment: s.whyThisSegment,
      acquisitionAngle: s.acquisitionAngle,
      ...(evidence ? { evidence } : {}),
    });
  }

  /* Normalise percentages if they don't sum to 100 */
  if (Math.abs(pctSum - 100) > 5) return null;
  if (pctSum !== 100) {
    const scale = 100 / pctSum;
    let remaining = 100;
    for (let i = 0; i < segments.length - 1; i++) {
      segments[i]!.percent = Math.round(segments[i]!.percent * scale);
      remaining -= segments[i]!.percent;
    }
    segments[4]!.percent = remaining;
  }

  /* Validate insights */
  const insights: AudienceInsight[] = [];
  for (const ins of r.insights) {
    const i = ins as Record<string, unknown>;
    if (typeof i.title !== "string" || typeof i.description !== "string") return null;
    insights.push({ title: i.title, description: i.description });
  }

  /* Build evidenceSummary — always ai_hypothesis for AI-generated results */
  const evidenceSummary: EvidenceSummary = {
    sourceMode: "ai_hypothesis",
    confidenceReason: "Audience segments are hypotheses based on product context. No live Reddit, X, TikTok, or competitor data has been read.",
    totalSignals: 0,
    strongestSignals: [],
    limitations: [
      "This is a directional MVP estimate.",
      "Live social and competitor data is not connected yet.",
      "Validate with real user conversations before making decisions.",
    ],
  };

  return {
    productSummary: r.productSummary,
    region: r.region,
    category: r.category,
    confidence: r.confidence as "Low" | "Medium" | "High",
    reachableAudience: { min: ra.min as number, max: ra.max as number, label: ra.label as string },
    ...(() => {
      const rawCovPct = typeof cov.percent === "number" ? (cov.percent as number) : 0;
      const validCovPct = rawCovPct >= 3 && rawCovPct <= 28
        ? rawCovPct
        : calculateCoverageEstimate({ category: r.category as string, sourceMode: "ai_hypothesis", segments });
      return recalculateCoverageFields(validCovPct, ra.min as number, ra.max as number);
    })(),
    segments,
    insights,
    evidenceSummary,
  };
}

/* ─── AI generation service ─────────────────────────────────────── */
export type FallbackReason =
  | "timeout"
  | "model_error"
  | "validation_failed"
  | "missing_credentials"
  | "ai_error"
  | "unknown";

export interface GenerateMeta {
  aiUsed: boolean;
  fallbackReason: FallbackReason | null;
  model: string;
  durationMs: number;
}

/* `gpt-5-nano` is the fastest model in the Replit AI Integrations
   catalog, which matters here because the audience-map prompt asks
   for a long, structured JSON response and previously timed out at
   12s on `gpt-5-mini`. Quality is acceptable for segment generation
   and the speed gain pushes us comfortably under the 18s budget. */
const MAIN_AUDIENCE_MODEL = "gpt-5-nano";
const MAIN_AI_TIMEOUT_MS = 18_000;
const MAIN_AI_MAX_TOKENS = 8192;

export async function generateAudienceMapWithAI(params: {
  productIdea: string;
  targetUsers: string;
  problem: string;
  goal: string;
  finalCategory: string;
  finalRegion: string;
}): Promise<{ map: AudienceMapResult | null; meta: GenerateMeta }> {
  const startedAt = Date.now();
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    return {
      map: null,
      meta: { aiUsed: false, fallbackReason: "missing_credentials", model: MAIN_AUDIENCE_MODEL, durationMs: Date.now() - startedAt },
    };
  }

  const { productIdea, targetUsers, problem, goal, finalCategory, finalRegion } = params;
  const regionLabel = REGION_LABELS[finalRegion] ?? finalRegion;
  const [reachMin, reachMax] = REGION_REACH[finalRegion] ?? [500_000, 900_000];
  const categoryLabel = CATEGORY_LABELS[finalCategory] ?? finalCategory;

  const isVague = [productIdea, targetUsers, problem].every((s) => !s || s.trim().length < 10);
  const confidence = isVague ? "Low" : "Medium";

  const systemPrompt = `You are an audience intelligence analyst for early-stage founders.
Your job is to identify 5 practical, PRODUCT-SPECIFIC audience segments so the founder knows exactly who to target first.
Be honest — treat audience numbers as directional MVP estimates, not official statistics.
Do not use words like "verified", "official", "census-backed", or "guaranteed".

Naming rules — these are CRITICAL:
- Segment names MUST be derived from THIS specific product idea, target users, problem, use case, buyer intent, workflow, or job-to-be-done.
- Prefer name patterns like:
    "[role/people] [verb] [specific pain or use case]"
    "[users of current alternative] who need [outcome]"
    "[buyer/user type] trying to [job-to-be-done]"
    "[high-intent group] already searching/complaining about [problem]"
- Banned generic labels (do NOT use unless the product itself is explicitly demographic-led):
    "Gen Z Adopters", "Millennial Professionals", "Remote Workers", "Parents", "Lifelong Learners",
    "Early Adopters", "Mainstream Buyers", "Casual Browsers", "Niche Power Users", "Value Seekers",
    "Power Users" used alone, plain "Founders", plain "Professionals".
- The 5 segments must represent meaningfully DIFFERENT early-user groups (different roles, pains, intents) — not five rewordings of the same person.
- Length: 3–7 words per name. Specific enough to feel tailored, short enough to fit a card.

Return ONLY valid JSON, no markdown, no explanation.`;

  const hintCovPct    = calculateCoverageEstimate({ category: finalCategory, productIdea, targetUsers, problem, sourceMode: "ai_hypothesis" });
  const hintCovPeople = Math.round(reachMin * hintCovPct / 100);
  const hintUntPct    = 100 - hintCovPct;

  const userPrompt = `Analyse this product and return an audience map as strict JSON.

Product idea: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem solved: ${problem || "Not specified"}
Founder goal: ${goal || "Not specified"}
Category: ${categoryLabel}
Region: ${regionLabel}
Estimated reachable audience: ${reachMin.toLocaleString()}–${reachMax.toLocaleString()} people (directional estimate)

Return a JSON object with exactly this shape — no extra keys:
{
  "productSummary": "One-sentence description of the product and who it's for",
  "region": "${regionLabel}",
  "category": "${categoryLabel}",
  "confidence": "${confidence}",
  "reachableAudience": {
    "min": ${reachMin},
    "max": ${reachMax},
    "label": "people in ${regionLabel}"
  },
  "coverage": {
    "percent": ${hintCovPct},
    "people": ${hintCovPeople}
  },
  "untapped": {
    "percent": ${hintUntPct},
    "min": ${Math.round(reachMin * hintUntPct / 100)},
    "max": ${Math.round(reachMax * hintUntPct / 100)}
  },
  "segments": [
    {
      "id": "segment-1",
      "name": "Short product-specific name (3–7 words, derived from this product idea / target users / problem)",
      "percent": 25,
      "audienceMin": ${Math.round(reachMin * 0.25)},
      "audienceMax": ${Math.round(reachMax * 0.25)},
      "color": "purple",
      "painPoints": ["Pain 1", "Pain 2"],
      "platforms": ["Platform 1", "Platform 2"],
      "whyThisSegment": "Why this segment matters for this product",
      "acquisitionAngle": "Specific go-to-market angle for this segment",
      "evidence": {
        "signalStrength": "Medium",
        "exampleUserLanguage": ["Phrase a real user in this segment would say", "Another phrase"],
        "likelySearchQueries": ["search term 1", "search term 2"],
        "competitorMentions": [],
        "unmetNeeds": ["Specific unmet need 1", "Specific unmet need 2"],
        "objections": ["Likely objection 1", "Likely objection 2"]
      }
    }
    // ... exactly 5 segments total, colors must be: purple, blue, green, orange, pink in that order
    // percentages must sum to exactly 100
  ],
  "insights": [
    { "title": "Biggest opportunity", "description": "..." },
    { "title": "Quick win", "description": "..." },
    { "title": "Untapped upside", "description": "..." }
  ]
}

Rules:
- Exactly 5 segments
- Segment colors in order: purple, blue, green, orange, pink
- Segment percentages sum to exactly 100
- audienceMin and audienceMax must scale with percent (e.g. 25% of ${reachMin} = ${Math.round(reachMin * 0.25)})
- Make segment names, painPoints, platforms, whyThisSegment, and acquisitionAngle specific to this product
- Re-read the system prompt's naming rules before writing each segment name. Names must NOT be generic demographic/lifestyle labels.
- Example of GOOD names for an AI file organiser for founders: "Founders losing track of saved files", "Operators stuck searching for documents", "Indie hackers with cluttered desktops", "Teams using search as a workaround", "Power users wanting auto-tagged assets". These are illustrative — derive your own from THIS product, do not copy them.
- Keep descriptions practical and actionable — useful for deciding who to target first
- For evidence fields: these are HYPOTHESES based on the product context — do not claim to have read Reddit, X, TikTok, or any live source
- exampleUserLanguage: 2–3 realistic phrases a person in this segment would actually say
- likelySearchQueries: 2–3 search terms they would type
- unmetNeeds: 2–3 specific needs the product could address beyond the pain points listed
- objections: 2–3 realistic reasons they might not adopt the product
- competitorMentions: only include obvious category competitors, otherwise []`;

  const client = new OpenAI({ apiKey, baseURL });

  /* Run main audience-map generation and competitor generation in parallel.
     This avoids the previous serial path where a slow main call left no
     headroom for competitors before the frontend timeout. */
  type MainOutcome =
    | { kind: "ok"; validated: AudienceMapResult }
    | { kind: "timeout" }
    | { kind: "model_error" }
    | { kind: "validation_failed" }
    | { kind: "ai_error" };

  const mainPromise: Promise<MainOutcome> = (async () => {
    try {
      /* `reasoning_effort: "minimal"` disables internal chain-of-thought,
         which is what was making gpt-5-* time out on this prompt. We don't
         need deep reasoning to produce a structured audience map — straight
         instruction following is faster and just as good for this task. */
      const response = await client.chat.completions.create(
        {
          model: MAIN_AUDIENCE_MODEL,
          max_completion_tokens: MAIN_AI_MAX_TOKENS,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          reasoning_effort: "minimal",
        },
        { signal: AbortSignal.timeout(MAIN_AI_TIMEOUT_MS) },
      );
      const content = response.choices[0]?.message?.content;
      if (!content) return { kind: "validation_failed" };
      try {
        const parsed: unknown = JSON.parse(content);
        const validated = validateResult(parsed);
        if (!validated) return { kind: "validation_failed" };
        return { kind: "ok", validated };
      } catch {
        return { kind: "validation_failed" };
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; status?: number; response?: { status?: number } };
      const name = e?.name ?? "";
      const msg = String(e?.message ?? "");
      if (name === "AbortError" || /timed?\s*out|aborted/i.test(msg)) return { kind: "timeout" };
      const status = e?.status ?? e?.response?.status;
      if (status === 400 || status === 404 || /model/i.test(msg)) return { kind: "model_error" };
      return { kind: "ai_error" };
    }
  })();

  const compPromise = generateCompetitorsWithAI(client, {
    productIdea, targetUsers, problem, goal,
    category: categoryLabel, region: regionLabel,
  }).catch(() => null);

  const [mainOutcome, aiCompetitors] = await Promise.all([mainPromise, compPromise]);
  const durationMs = Date.now() - startedAt;

  if (mainOutcome.kind !== "ok") {
    const fallbackReason: FallbackReason =
      mainOutcome.kind === "timeout"            ? "timeout" :
      mainOutcome.kind === "model_error"        ? "model_error" :
      mainOutcome.kind === "validation_failed"  ? "validation_failed" :
      "ai_error";
    return { map: null, meta: { aiUsed: false, fallbackReason, model: MAIN_AUDIENCE_MODEL, durationMs } };
  }

  return {
    map: { ...mainOutcome.validated, competitors: aiCompetitors ?? getCompetitorFallback(finalCategory) },
    meta: { aiUsed: true, fallbackReason: null, model: MAIN_AUDIENCE_MODEL, durationMs },
  };
}
