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
export function buildMockResult(
  productIdea: string,
  finalCategory: string,
  finalRegion: string,
): AudienceMapResult {
  const regionLabel = REGION_LABELS[finalRegion] ?? finalRegion;
  const [reachMin, reachMax] = REGION_REACH[finalRegion] ?? [500_000, 900_000];
  const categoryLabel = CATEGORY_LABELS[finalCategory] ?? finalCategory;
  const templates = resolveTemplate(finalCategory);

  const coveragePct    = calculateCoverageEstimate({ category: finalCategory, productIdea, sourceMode: "mock" });
  const coveragePeople = Math.round(reachMin * (coveragePct / 100));
  const untappedPct    = 100 - coveragePct;

  const segments: AudienceSegment[] = templates.map((t) => ({
    id: t.id,
    name: t.name,
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
export async function generateAudienceMapWithAI(params: {
  productIdea: string;
  targetUsers: string;
  problem: string;
  goal: string;
  finalCategory: string;
  finalRegion: string;
}): Promise<AudienceMapResult | null> {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) return null;

  const { productIdea, targetUsers, problem, goal, finalCategory, finalRegion } = params;
  const regionLabel = REGION_LABELS[finalRegion] ?? finalRegion;
  const [reachMin, reachMax] = REGION_REACH[finalRegion] ?? [500_000, 900_000];
  const categoryLabel = CATEGORY_LABELS[finalCategory] ?? finalCategory;

  const isVague = [productIdea, targetUsers, problem].every((s) => !s || s.trim().length < 10);
  const confidence = isVague ? "Low" : "Medium";

  const systemPrompt = `You are an audience intelligence analyst for early-stage founders.
Your job is to identify practical audience segments for a product so the founder knows who to target first.
Be honest — treat audience numbers as directional MVP estimates, not official statistics.
Do not use words like "verified", "official", "census-backed", or "guaranteed".
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
      "name": "Specific segment name",
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
- Keep descriptions practical and actionable — useful for deciding who to target first
- For evidence fields: these are HYPOTHESES based on the product context — do not claim to have read Reddit, X, TikTok, or any live source
- exampleUserLanguage: 2–3 realistic phrases a person in this segment would actually say
- likelySearchQueries: 2–3 search terms they would type
- unmetNeeds: 2–3 specific needs the product could address beyond the pain points listed
- objections: 2–3 realistic reasons they might not adopt the product
- competitorMentions: only include obvious category competitors, otherwise []`;

  try {
    const client = new OpenAI({ apiKey, baseURL });
    const response = await client.chat.completions.create(
      {
        model: "gpt-5.4",
        max_completion_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(9_000) },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed: unknown = JSON.parse(content);
    return validateResult(parsed);
  } catch {
    return null;
  }
}
