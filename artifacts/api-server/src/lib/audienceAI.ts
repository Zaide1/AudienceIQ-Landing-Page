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

/* ─── Context-aware competitor fallback ─────────────────────────── */

function buildContextAwareFallbackCompetitors(params: {
  productIdea: string;
  targetUsers: string;
  problem: string;
  category: string;
}): CompetitorIntelligence {
  const { productIdea, targetUsers, problem, category } = params;

  const ctx = `${productIdea} ${targetUsers} ${problem}`.toLowerCase();
  const catLower = category.toLowerCase();

  const domainTokens = extractNamingTokens(productIdea, 6);
  const userTokens = extractNamingTokens(targetUsers, 4);
  const problemTokens = extractNamingTokens(problem, 4);
  const domainPhrase = domainTokens.slice(0, 3).join(" ") || catLower;
  const userPhrase = userTokens.slice(0, 2).join(" ") || "target users";
  const problemPhrase = problemTokens.slice(0, 3).join(" ") || "current pain points";

  const direct: CompetitorItem[] = [
    {
      name: `Leading ${domainPhrase} apps`,
      type: "direct",
      whyRelevant: `Established products already solving parts of "${problemPhrase}" for ${userPhrase}`,
      targetOverlap: `${userPhrase} actively looking for solutions`,
      weaknessToExploit: "Generic approach — not tailored to this specific use case or audience",
      confidence: "low",
    },
    {
      name: `Niche ${domainPhrase} tools`,
      type: "direct",
      whyRelevant: `Smaller or newer products targeting the same domain`,
      targetOverlap: `${userPhrase} who have tried alternatives`,
      weaknessToExploit: "Limited features or small user base — opportunity to build something more complete",
      confidence: "low",
    },
  ];

  const substituteOptions: Array<{ name: string; why: string; overlap: string; weakness: string }> = [];

  if (["social", "community", "forum", "chat", "network", "connect"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Social media groups and pages", why: `${userPhrase} gather in Facebook groups, subreddits, or Discord servers around ${domainPhrase}`, overlap: `${userPhrase} seeking community`, weakness: "Fragmented, noisy, no structured experience" },
      { name: "Direct messaging and group chats", why: `Users coordinate via WhatsApp or Telegram instead of a dedicated tool`, overlap: `${userPhrase} with existing peer networks`, weakness: "No organisation, hard to scale, context gets lost" },
    );
  }
  if (["track", "log", "monitor", "data", "analytics", "measure", "score", "stat"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Spreadsheet tracking", why: `${userPhrase} build manual trackers in Google Sheets or Excel for ${domainPhrase}`, overlap: `Data-minded ${userPhrase}`, weakness: "High setup cost, no automation, breaks as a daily habit" },
      { name: "Notes and manual logging", why: `Users jot things down in Apple Notes or a notebook instead of using a dedicated tool`, overlap: `Casual ${userPhrase} not ready for a full app`, weakness: "No feedback, no trends, no accountability" },
    );
  }
  if (["learn", "teach", "course", "study", "train", "skill", "education", "tutor"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "YouTube tutorials", why: `Free video content covering ${domainPhrase} topics`, overlap: `${userPhrase} exploring options before committing`, weakness: "No structure, no progress tracking, inconsistent quality" },
      { name: "Peer learning and study groups", why: `${userPhrase} learn from each other in informal groups`, overlap: `${userPhrase} seeking community accountability`, weakness: "Inconsistent, no curriculum, depends on group quality" },
    );
  }
  if (["shop", "buy", "sell", "store", "market", "commerce", "product", "brand"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Marketplace browsing", why: `${userPhrase} browse Amazon, Etsy, or similar marketplaces for ${domainPhrase}`, overlap: `${userPhrase} comparing options`, weakness: "Overwhelming choice, no personalisation, algorithm-driven" },
      { name: "Social media selling", why: `Sellers use Instagram DMs or TikTok Shop instead of dedicated platforms`, overlap: `Early-stage ${userPhrase}`, weakness: "No inventory management, no analytics, platform dependency" },
    );
  }
  if (["game", "play", "sport", "football", "soccer", "basketball", "cricket", "tennis", "match", "team", "league", "fitness", "exercise", "workout", "run"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Existing sports and activity apps", why: `${userPhrase} already use general-purpose fitness or sports apps for ${domainPhrase}`, overlap: `Active ${userPhrase}`, weakness: "Too broad — not specialised for this specific activity or audience" },
      { name: "Manual coordination via group chats", why: `${userPhrase} organise activities through WhatsApp, iMessage, or team group chats`, overlap: `${userPhrase} with existing social circles`, weakness: "No scheduling intelligence, no history, hard to manage larger groups" },
    );
  }
  if (["money", "finance", "budget", "invest", "save", "bank", "payment", "expense"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Bank app spending review", why: `${userPhrase} scroll their bank app to check spending instead of using a dedicated tool`, overlap: `Casual ${userPhrase}`, weakness: "Reactive, no planning, no trend analysis, no goals" },
      { name: "Spreadsheet budgeting", why: `${userPhrase} track finances manually in Google Sheets`, overlap: `Data-minded ${userPhrase}`, weakness: "Manual, error-prone, no real-time syncing" },
    );
  }
  if (["content", "creator", "video", "podcast", "newsletter", "blog", "post", "publish"].some((w) => ctx.includes(w))) {
    substituteOptions.push(
      { name: "Native platform posting", why: `${userPhrase} post directly on each platform without scheduling or planning tools`, overlap: `Early-stage ${userPhrase}`, weakness: "No consistency, no analytics, context switching between platforms" },
      { name: "Notes app for drafting", why: `${userPhrase} draft ideas and content in Apple Notes or Google Docs`, overlap: `${userPhrase} managing content ideas`, weakness: "No publishing, no calendar, no collaboration" },
    );
  }

  if (substituteOptions.length < 2) {
    substituteOptions.push(
      { name: `Searching online for ${domainPhrase}`, why: `${userPhrase} search Google, Reddit, or YouTube for answers instead of using a dedicated solution`, overlap: `${userPhrase} in early discovery`, weakness: "Scattered results, no personalisation, time-consuming to piece together" },
      { name: `Asking peers for advice`, why: `${userPhrase} ask friends, colleagues, or online communities for recommendations on ${domainPhrase}`, overlap: `${userPhrase} who value social proof`, weakness: "Biased, inconsistent, depends on who you know" },
    );
  }

  const substitutes: CompetitorItem[] = substituteOptions.slice(0, 3).map((s) => ({
    name: s.name,
    type: "substitute" as const,
    whyRelevant: s.why,
    targetOverlap: s.overlap,
    weaknessToExploit: s.weakness,
    confidence: "low" as const,
  }));

  const adjacent: CompetitorItem[] = [
    {
      name: `General-purpose tools used for ${domainPhrase}`,
      type: "adjacent",
      whyRelevant: `Broad platforms (social media, productivity apps) that ${userPhrase} currently repurpose for parts of this job`,
      targetOverlap: `${userPhrase} not yet aware a specialised solution exists`,
      weaknessToExploit: "Not purpose-built — requires workarounds and manual effort",
      confidence: "low",
    },
  ];

  return {
    direct,
    adjacent,
    substitutes,
    notes: `Fallback estimates for ${domainPhrase} — AI competitor analysis was not available. Treat as directional only.`,
  };
}

/* ─── Lightweight relevance guard for AI-returned competitors ───── */
function isCompetitorRelevant(
  competitor: CompetitorItem,
  domainTokens: string[],
  productIdea: string,
  category: string,
): boolean {

  const KNOWN_IRRELEVANT_UNLESS_MATCHED: Record<string, string[]> = {
    "Duolingo": ["language", "learn", "education", "study", "vocab", "lesson"],
    "Headspace": ["meditat", "mindful", "mental", "wellness", "calm", "sleep", "stress"],
    "Zapier": ["automat", "integrat", "workflow", "connect", "zap", "trigger"],
    "Apple Shortcuts": ["automat", "shortcut", "workflow", "siri"],
    "Notion": ["note", "wiki", "knowledge", "document", "workspace", "project"],
    "Slack": ["messag", "chat", "team", "communicat", "channel"],
    "Trello": ["board", "kanban", "project", "task", "manage"],
    "Canva": ["design", "graphic", "visual", "poster", "banner"],
  };

  const compName = competitor.name.trim();
  const ctx = `${productIdea} ${category}`.toLowerCase();

  for (const [knownApp, requiredTokens] of Object.entries(KNOWN_IRRELEVANT_UNLESS_MATCHED)) {
    if (compName.toLowerCase().includes(knownApp.toLowerCase())) {
      const matches = requiredTokens.some((t) => ctx.includes(t));
      if (!matches) return false;
    }
  }

  return true;
}

function applyRelevanceGuard(
  intelligence: CompetitorIntelligence,
  productIdea: string,
  category: string,
): { filtered: CompetitorIntelligence; rejected: string[] } {
  const domainTokens = extractNamingTokens(productIdea, 8);
  const rejected: string[] = [];

  function filterList(items: CompetitorItem[]): CompetitorItem[] {
    return items.filter((item) => {
      const relevant = isCompetitorRelevant(item, domainTokens, productIdea, category);
      if (!relevant) rejected.push(item.name);
      return relevant;
    });
  }

  return {
    filtered: {
      direct: filterList(intelligence.direct),
      adjacent: filterList(intelligence.adjacent),
      substitutes: filterList(intelligence.substitutes),
      notes: intelligence.notes,
    },
    rejected,
  };
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
Identify named competitors and substitute behaviours for THIS SPECIFIC product.
Use "likely" framing unless the product is in a well-known category.
Return ONLY valid JSON.

Product idea: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem being solved: ${problem || "Not specified"}
Founder goal: ${goal || "Not specified"}
Category: ${category}
Region: ${region}

CRITICAL — Domain relevance rules:
- Every competitor MUST be something the target users described above would realistically use, compare, search for, or substitute instead of THIS product.
- Ground your analysis in the specific product domain. A football app competes with other football/sports apps, NOT with Duolingo or Headspace.
- Do NOT return famous apps from unrelated domains (language learning, wellness, automation, productivity) unless the product itself is in that domain.
- Before including each competitor, ask: "Would ${targetUsers || "the target user"} realistically compare this to ${productIdea || "this product"}?" If no, exclude it.
- If a competitor is only loosely related, set confidence to "low".
- Prefer domain-specific competitors over generic well-known brands.

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
  "notes": "1-sentence landscape summary grounded in the product domain"
}

Rules:
- direct: 2–4 products solving the same core job for the same users
- adjacent: 2–3 products competing for the same user attention, budget, or workflow
- substitutes: 2–3 manual workarounds or current user behaviours the target users actually do today (not random apps)
- confidence: "medium" for well-known category matches, "low" if speculative or loosely related
- Do NOT include sourceUrl — reserved for source-backed signals only
- Do NOT invent fake company names
- Do NOT include competitors from unrelated industries`;

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
    competitors: buildContextAwareFallbackCompetitors({ productIdea, targetUsers, problem, category: finalCategory }),
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
  competitorSource?: "ai" | "fallback";
  rejectedCompetitors?: string[];
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
    return { map: null, meta: { aiUsed: false, fallbackReason, model: MAIN_AUDIENCE_MODEL, durationMs, competitorSource: "fallback" as const, rejectedCompetitors: [] } };
  }

  const competitorSourceUsed = aiCompetitors ? "ai" : "fallback";
  const rawCompetitors = aiCompetitors ?? buildContextAwareFallbackCompetitors({ productIdea, targetUsers, problem, category: finalCategory });
  const { filtered, rejected } = applyRelevanceGuard(rawCompetitors, productIdea, finalCategory);

  return {
    map: { ...mainOutcome.validated, competitors: filtered },
    meta: { aiUsed: true, fallbackReason: null, model: MAIN_AUDIENCE_MODEL, durationMs, competitorSource: competitorSourceUsed as "ai" | "fallback", rejectedCompetitors: rejected },
  };
}
