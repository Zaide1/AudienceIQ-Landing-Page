import OpenAI from "openai";
import { logger } from "./logger";
import type {
  AudienceMapResult,
  AudienceSegment,
  EvidenceSummary,
} from "./audienceAI";

/* ─── ResearchSignal type (spec-compliant) ──────────────────────── */
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

export interface CollectSignalsResult {
  sourceMode: "live_research" | "ai_hypothesis";
  signals: ResearchSignal[];
  urlBackedSignalCount: number;
  evidenceSummary: EvidenceSummary;
  updatedSegments: AudienceSegment[];
}

/* ─── HN Algolia hit type ───────────────────────────────────────── */
interface HnHit {
  objectID: string;
  title?: string;
  url?: string;
  story_text?: string;
  points?: number;
}

/* ─── Step 1: Generate research queries via OpenAI ──────────────── */
async function generateQueries(
  client: OpenAI,
  params: {
    productIdea: string;
    targetUsers: string;
    problem: string;
    category: string;
    region: string;
    segmentNames: string[];
    competitorMentions: string[];
  },
): Promise<string[]> {
  const { productIdea, targetUsers, problem, category, region, segmentNames, competitorMentions } = params;

  const prompt = `You are a market research strategist. Generate 6 short search queries to find Hacker News stories about this product's audience.

Product: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem solved: ${problem || "Not specified"}
Category: ${category}
Region: ${region}
Segments: ${segmentNames.join(", ")}
${competitorMentions.length > 0 ? `Competitors: ${competitorMentions.join(", ")}` : ""}

Return ONLY a JSON object with key "queries" containing an array of 6 strings:
{"queries": ["query 1", "query 2", ...]}

Rules:
- Each query: 3–6 words
- Mix: category tools, user frustrations, alternatives, product launches in this space
- Queries should be likely to match real HN story titles`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-mini",
        max_completion_tokens: 256,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const arr = Array.isArray(parsed.queries) ? parsed.queries : [];
    return (arr as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 8);
  } catch (err) {
    logger.warn({ err }, "research: query generation failed, using fallback");
    return [
      `${category} app alternatives`,
      `${productIdea || category} Show HN`,
      `${targetUsers || "users"} ${category} frustrations`,
      `${problem || category} tools`,
      `${category} market trends`,
      `${productIdea || category} launch`,
    ];
  }
}

/* ─── Step 2: Fetch Hacker News Algolia API ─────────────────────── */
/* Public API, no key required. Each hit has objectID so every result
   gets a real verifiable URL at https://news.ycombinator.com/item?id= */
async function fetchHnSignals(
  queries: string[],
): Promise<Array<{ title: string; snippet: string; url: string; query: string }>> {
  const results: Array<{ title: string; snippet: string; url: string; query: string }> = [];

  await Promise.all(
    queries.map(async (query) => {
      try {
        const encoded = encodeURIComponent(query);
        const res = await fetch(
          `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=story&hitsPerPage=3`,
          { signal: AbortSignal.timeout(6_000) },
        );
        if (!res.ok) return;
        const data = await res.json() as { hits: HnHit[] };

        for (const hit of data.hits ?? []) {
          if (!hit.title) continue;
          /* Every story has an objectID → guaranteed real URL */
          const url = hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const rawText = hit.story_text ?? "";
          const snippet = rawText.replace(/<[^>]+>/g, "").trim().slice(0, 280) || hit.title;
          results.push({ title: hit.title, snippet, url, query });
        }
      } catch (err) {
        logger.warn({ err, query }, "research: HN fetch failed for query");
      }
    }),
  );

  return results;
}

/* ─── Step 3: Classify raw signals via OpenAI ───────────────────── */
async function classifySignals(
  client: OpenAI,
  rawSignals: Array<{ title: string; snippet: string; url: string; query: string }>,
  segments: AudienceSegment[],
): Promise<ResearchSignal[]> {
  if (rawSignals.length === 0) return [];

  const segmentList = segments.map((s) => `${s.id}: ${s.name}`).join(", ");
  const prompt = `You are a market research analyst. Classify these HN stories as audience research signals.

Audience segments: ${segmentList}

Stories to classify (JSON):
${JSON.stringify(rawSignals.map((s, i) => ({ index: i + 1, query: s.query, title: s.title, snippet: s.snippet.slice(0, 120) })))}

Return a JSON object with key "signals" — one item per story:
{"signals": [
  {
    "index": 1,
    "sentiment": "positive"|"negative"|"neutral"|"mixed",
    "signalType": "pain_point"|"competitor"|"objection"|"unmet_need"|"language"|"channel",
    "segmentId": "<one of the segment ids above, or null>"
  }
]}

signalType guide:
- pain_point: a problem or frustration users have
- competitor: mentions an alternative product
- objection: reason someone would not buy
- unmet_need: something users want but can't get
- language: natural user phrasing about the topic
- channel: where/how people find solutions`;

  const VALID_SENTIMENT = ["positive", "negative", "neutral", "mixed"] as const;
  const VALID_TYPE     = ["pain_point", "competitor", "objection", "unmet_need", "language", "channel"] as const;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed  = JSON.parse(content) as { signals?: unknown[] };
    const cls     = (parsed.signals ?? []) as Array<Record<string, unknown>>;

    return rawSignals.map((raw, i) => {
      const c         = cls.find((x) => x.index === i + 1) ?? {};
      const sentiment = VALID_SENTIMENT.includes(c.sentiment as typeof VALID_SENTIMENT[number])
        ? c.sentiment as typeof VALID_SENTIMENT[number]
        : "neutral";
      const signalType = VALID_TYPE.includes(c.signalType as typeof VALID_TYPE[number])
        ? c.signalType as typeof VALID_TYPE[number]
        : "pain_point";
      const segmentId = segments.find((s) => s.id === c.segmentId)?.id;

      return {
        id:          `signal-hn-${Date.now()}-${i}`,
        source:      "hacker_news" as const,
        query:       raw.query,
        title:       raw.title,
        snippet:     raw.snippet,
        url:         raw.url,
        sentiment,
        signalType,
        ...(segmentId ? { segmentId } : {}),
        createdAt:   new Date().toISOString(),
      };
    });
  } catch (err) {
    logger.warn({ err }, "research: signal classification failed, using defaults");
    return rawSignals.map((raw, i) => ({
      id:        `signal-hn-${Date.now()}-${i}`,
      source:    "hacker_news" as const,
      query:     raw.query,
      title:     raw.title,
      snippet:   raw.snippet,
      url:       raw.url,
      sentiment: "neutral" as const,
      signalType: "pain_point" as const,
      createdAt:  new Date().toISOString(),
    }));
  }
}

/* ─── Step 4: AI-hypothesis fallback signals ────────────────────── */
async function buildHypothesisSignals(
  client: OpenAI,
  params: {
    productIdea: string;
    targetUsers: string;
    problem: string;
    category: string;
    segments: AudienceSegment[];
  },
): Promise<ResearchSignal[]> {
  const { productIdea, targetUsers, problem, category, segments } = params;

  const prompt = `You are a market research analyst. Generate 6 realistic audience research hypotheses for this product.

Product: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem solved: ${problem || "Not specified"}
Category: ${category}
Segments: ${segments.map((s) => `${s.id}: ${s.name}`).join(", ")}

Return a JSON object with key "signals" containing exactly 6 items:
{"signals": [
  {
    "title": "Short descriptive title (max 80 chars)",
    "snippet": "2-3 sentences in realistic user voice describing a pain, need, or objection",
    "sentiment": "positive"|"negative"|"neutral"|"mixed",
    "signalType": "pain_point"|"competitor"|"objection"|"unmet_need"|"language"|"channel",
    "segmentId": "<one of: ${segments.map((s) => s.id).join(", ")}>"
  }
]}

Make signals specific to this product's context and realistic. No URLs — these are AI hypotheses.`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed  = JSON.parse(content) as { signals?: unknown[] };
    const raw     = (parsed.signals ?? []) as Array<Record<string, unknown>>;

    const VALID_SENTIMENT = ["positive", "negative", "neutral", "mixed"] as const;
    const VALID_TYPE      = ["pain_point", "competitor", "objection", "unmet_need", "language", "channel"] as const;

    return raw.map((item, i) => {
      const sentiment  = VALID_SENTIMENT.includes(item.sentiment as typeof VALID_SENTIMENT[number])
        ? item.sentiment as typeof VALID_SENTIMENT[number]
        : "neutral";
      const signalType = VALID_TYPE.includes(item.signalType as typeof VALID_TYPE[number])
        ? item.signalType as typeof VALID_TYPE[number]
        : "pain_point";
      const segmentId  = segments.find((s) => s.id === item.segmentId)?.id;

      return {
        id:        `signal-hyp-${Date.now()}-${i}`,
        source:    "manual" as const,
        query:     `${category} hypothesis`,
        title:     typeof item.title === "string" ? item.title.slice(0, 100) : "Research hypothesis",
        snippet:   typeof item.snippet === "string" ? item.snippet.slice(0, 280) : "",
        sentiment,
        signalType,
        ...(segmentId ? { segmentId } : {}),
        createdAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    logger.warn({ err }, "research: hypothesis signal generation failed");
    return [];
  }
}

/* ─── Category relevance helper ─────────────────────────────────── */
const TECH_CATEGORIES = [
  "developer tools", "saas", "ai", "artificial intelligence", "productivity",
  "data", "analytics", "software", "b2b", "enterprise", "developer", "devtools",
  "startup", "fintech", "edtech", "hr tech", "marketing tech",
];

function isTechCategory(category: string): boolean {
  const lower = category.toLowerCase();
  return TECH_CATEGORIES.some((t) => lower.includes(t));
}

/* ─── Step 5: Build evidenceSummary + updatedSegments ───────────── */
function buildResults(
  signals: ResearchSignal[],
  urlBackedCount: number,
  sourceMode: "live_research" | "ai_hypothesis",
  segments: AudienceSegment[],
  category: string,
): { evidenceSummary: EvidenceSummary; updatedSegments: AudienceSegment[] } {
  const strongestSignals = signals
    .filter((s) => s.signalType === "pain_point" || s.signalType === "unmet_need")
    .slice(0, 5)
    .map((s) => s.snippet.slice(0, 100));

  const isTech = isTechCategory(category);
  const hnRelevanceNote = isTech
    ? "Hacker News skews toward technical and startup audiences — well-suited for this category."
    : "Hacker News skews toward technical/startup audiences and may not represent mainstream consumer demand for this category.";

  const confidenceReason = sourceMode === "live_research"
    ? `Based on ${urlBackedCount} public Hacker News discussion signals plus AI audience analysis.`
    : urlBackedCount > 0
      ? `Only ${urlBackedCount} Hacker News signal(s) found (minimum 3 needed for live_research mode). Supplemented with AI hypotheses.`
      : "No live source-backed signals were collected. All signals are AI-generated hypotheses based on product context.";

  const hnLimitations = sourceMode === "live_research"
    ? [
        "Signals are from public Hacker News discussions — not scraped from Reddit, X, TikTok, or review sites.",
        hnRelevanceNote,
        "Validate with sources closer to your actual audience before making decisions.",
      ]
    : [
        "This is a directional MVP estimate.",
        "Live social and competitor data is not connected yet.",
        "Validate with real user conversations before making decisions.",
      ];

  const evidenceSummary: EvidenceSummary = {
    sourceMode,
    confidenceReason,
    totalSignals: signals.length,
    strongestSignals,
    limitations: hnLimitations,
    ...(sourceMode === "live_research" ? { sourcesUsed: ["hacker_news"] } : {}),
  };

  /* Only update segment evidence when there are signals for that segment.
     If no signals match a segment, preserve its existing evidence untouched. */
  const updatedSegments: AudienceSegment[] = segments.map((seg) => {
    const segSignals = signals.filter((s) => s.segmentId === seg.id);
    if (segSignals.length === 0) return seg; /* preserve existing */

    const painSignals = segSignals.filter((s) => s.signalType === "pain_point" || s.signalType === "unmet_need");
    const objSignals  = segSignals.filter((s) => s.signalType === "objection");
    const langSignals = segSignals.filter((s) => s.signalType === "language");
    const compSignals = segSignals.filter((s) => s.signalType === "competitor");

    const existing = seg.evidence;

    return {
      ...seg,
      evidence: {
        signalStrength: segSignals.length >= 3 ? "High" : "Medium",
        exampleUserLanguage: langSignals.length > 0
          ? langSignals.map((s) => s.snippet.slice(0, 120))
          : (existing?.exampleUserLanguage ?? []),
        likelySearchQueries: [...new Set(segSignals.map((s) => s.query))].slice(0, 4),
        competitorMentions: compSignals.length > 0
          ? compSignals.map((s) => s.title)
          : (existing?.competitorMentions ?? []),
        unmetNeeds: painSignals.length > 0
          ? painSignals.map((s) => s.snippet.slice(0, 120))
          : (existing?.unmetNeeds ?? []),
        objections: objSignals.length > 0
          ? objSignals.map((s) => s.snippet.slice(0, 120))
          : (existing?.objections ?? []),
      },
    };
  });

  return { evidenceSummary, updatedSegments };
}

/* ─── Main export ────────────────────────────────────────────────── */
export async function collectSignals(
  onboardingData: Record<string, string>,
  currentAudienceMap: AudienceMapResult,
): Promise<CollectSignalsResult> {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  const productIdea = onboardingData.productIdea ?? "";
  const targetUsers = onboardingData.targetUsers ?? "";
  const problem     = onboardingData.problem ?? "";
  const category    = currentAudienceMap.category;
  const region      = currentAudienceMap.region;
  const segments    = currentAudienceMap.segments;
  const competitorMentions = segments.flatMap((s) => s.evidence?.competitorMentions ?? []);

  /* No AI configured — return honest empty state, preserve map */
  if (!baseURL || !apiKey) {
    logger.warn("research: AI not configured, returning empty result");
    const { evidenceSummary, updatedSegments } = buildResults([], 0, "ai_hypothesis", segments, category);
    return { sourceMode: "ai_hypothesis", signals: [], urlBackedSignalCount: 0, evidenceSummary, updatedSegments };
  }

  const client = new OpenAI({ apiKey, baseURL });

  /* ── Step 1: Generate queries ── */
  const queries = await generateQueries(client, {
    productIdea, targetUsers, problem, category, region,
    segmentNames: segments.map((s) => s.name),
    competitorMentions,
  });
  logger.info({ queryCount: queries.length, queries }, "research: queries generated");

  /* ── Step 2: Fetch HN Algolia (real public source, no key needed) ── */
  const rawHnSignals = await fetchHnSignals(queries);
  const urlBackedCount = rawHnSignals.length; /* every HN result has a real URL */
  logger.info(
    { queryCount: queries.length, rawSignalCount: rawHnSignals.length, urlBackedCount },
    "research: HN fetch complete",
  );

  /* ── Step 3: Classify or generate hypotheses ── */
  let signals: ResearchSignal[];
  let sourceMode: "live_research" | "ai_hypothesis";

  if (urlBackedCount >= 3) {
    signals    = await classifySignals(client, rawHnSignals, segments);
    sourceMode = "live_research";
  } else {
    /* Not enough real signals — generate hypotheses AND include any real ones */
    const [hypSignals, classifiedReal] = await Promise.all([
      buildHypothesisSignals(client, { productIdea, targetUsers, problem, category, segments }),
      rawHnSignals.length > 0
        ? classifySignals(client, rawHnSignals, segments)
        : Promise.resolve([]),
    ]);
    signals    = [...classifiedReal, ...hypSignals];
    sourceMode = "ai_hypothesis";
  }

  logger.info(
    { totalSignals: signals.length, urlBackedCount, sourceMode },
    "research: collection complete",
  );

  const { evidenceSummary, updatedSegments } = buildResults(signals, urlBackedCount, sourceMode, segments, category);

  return { sourceMode, signals, urlBackedSignalCount: urlBackedCount, evidenceSummary, updatedSegments };
}
