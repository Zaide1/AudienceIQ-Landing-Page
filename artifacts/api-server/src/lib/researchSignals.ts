import OpenAI from "openai";
import type {
  AudienceMapResult,
  AudienceSegment,
  EvidenceSummary,
} from "./audienceAI";

/* ─── ResearchSignal type (spec-compliant) ──────────────────────── */
export interface ResearchSignal {
  id: string;
  source: "web" | "competitor_site" | "youtube" | "review_site" | "manual";
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
  evidenceSummary: EvidenceSummary;
  updatedSegments: AudienceSegment[];
}

/* ─── DDG Instant Answer types ──────────────────────────────────── */
interface DdgRelatedTopic {
  Text?: string;
  FirstURL?: string;
  Topics?: DdgRelatedTopic[];
}

interface DdgResult {
  AbstractText?: string;
  AbstractURL?: string;
  RelatedTopics?: DdgRelatedTopic[];
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

  const prompt = `You are a market research strategist. Generate 6 short, targeted research queries to understand the audience for this product.

Product: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem solved: ${problem || "Not specified"}
Category: ${category}
Region: ${region}
Audience segments: ${segmentNames.join(", ")}
${competitorMentions.length > 0 ? `Known competitors: ${competitorMentions.join(", ")}` : ""}

Return ONLY a JSON array of 6 strings — plain search queries a researcher would type:
["query 1", "query 2", ...]

Rules:
- Each query: 3–7 words
- Cover: pain points, alternatives people use, frustrations, communities, and category terms
- Make queries specific to the product context
- No quotes within queries`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-nano",
        max_completion_tokens: 512,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const arr = Array.isArray(parsed.queries)
      ? parsed.queries
      : Object.values(parsed).find(Array.isArray) ?? [];
    return (arr as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 8);
  } catch {
    return [
      `${category} alternatives frustrations`,
      `best ${category} tools ${region}`,
      `${productIdea || category} user problems`,
      `${targetUsers || "users"} pain points ${category}`,
      `${category} community discussions`,
      `${problem || category} solutions comparison`,
    ];
  }
}

/* ─── Step 2: Fetch DuckDuckGo Instant Answer API ───────────────── */
async function fetchDdgSignal(query: string): Promise<{ title: string; snippet: string; url: string } | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(5_000) },
    );
    if (!res.ok) return null;
    const data = await res.json() as DdgResult;

    if (data.AbstractText && data.AbstractURL && data.AbstractText.length > 40) {
      return {
        title: query,
        snippet: data.AbstractText.slice(0, 280),
        url: data.AbstractURL,
      };
    }

    const topics: DdgRelatedTopic[] = [];
    for (const t of data.RelatedTopics ?? []) {
      if (t.Topics) topics.push(...t.Topics);
      else topics.push(t);
    }
    for (const t of topics) {
      if (t.Text && t.FirstURL && t.Text.length > 30) {
        return {
          title: t.Text.slice(0, 80),
          snippet: t.Text.slice(0, 280),
          url: t.FirstURL,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/* ─── Step 3: Classify raw snippets into typed signals ─────────── */
async function classifySignals(
  client: OpenAI,
  rawSignals: Array<{ title: string; snippet: string; url: string; query: string }>,
  segments: AudienceSegment[],
): Promise<ResearchSignal[]> {
  if (rawSignals.length === 0) return [];

  const segmentList = segments.map((s) => `${s.id}: ${s.name}`).join(", ");
  const prompt = `You are a market research analyst. Classify these research snippets for an audience intelligence tool.

Audience segments: ${segmentList}

Snippets to classify:
${rawSignals.map((s, i) => `${i + 1}. Query: "${s.query}" | Title: "${s.title}" | Snippet: "${s.snippet}"`).join("\n")}

Return a JSON object with key "signals" containing an array where each item has:
{
  "index": <original 1-based index>,
  "sentiment": "positive"|"negative"|"neutral"|"mixed",
  "signalType": "pain_point"|"competitor"|"objection"|"unmet_need"|"language"|"channel",
  "segmentId": <matching segment id from the list, or null>
}

signalType guide:
- pain_point: describes a frustration or problem
- competitor: mentions an alternative product or tool
- objection: reason someone would NOT buy
- unmet_need: something people want but can't get
- language: natural phrasing people use to describe their situation
- channel: where/how people find or discuss solutions`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-nano",
        max_completion_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { signals?: unknown[] };
    const classifications = parsed.signals ?? [];

    const VALID_SENTIMENT = ["positive", "negative", "neutral", "mixed"] as const;
    const VALID_TYPE = ["pain_point", "competitor", "objection", "unmet_need", "language", "channel"] as const;

    return rawSignals.map((raw, i) => {
      const cls = (classifications as Array<Record<string, unknown>>).find(
        (c) => c.index === i + 1,
      ) ?? {};
      const sentiment = VALID_SENTIMENT.includes(cls.sentiment as typeof VALID_SENTIMENT[number])
        ? cls.sentiment as typeof VALID_SENTIMENT[number]
        : "neutral";
      const signalType = VALID_TYPE.includes(cls.signalType as typeof VALID_TYPE[number])
        ? cls.signalType as typeof VALID_TYPE[number]
        : "pain_point";
      const segmentId = segments.find((s) => s.id === cls.segmentId)?.id;

      return {
        id: `signal-${Date.now()}-${i}`,
        source: "web" as const,
        query: raw.query,
        title: raw.title,
        snippet: raw.snippet,
        url: raw.url,
        sentiment,
        signalType,
        ...(segmentId ? { segmentId } : {}),
        createdAt: new Date().toISOString(),
      };
    });
  } catch {
    return rawSignals.map((raw, i) => ({
      id: `signal-${Date.now()}-${i}`,
      source: "web" as const,
      query: raw.query,
      title: raw.title,
      snippet: raw.snippet,
      url: raw.url,
      sentiment: "neutral" as const,
      signalType: "pain_point" as const,
      createdAt: new Date().toISOString(),
    }));
  }
}

/* ─── Step 4: Build AI-hypothesis fallback signals ──────────────── */
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

  const prompt = `You are a market research analyst. Generate 6 realistic audience research signals for this product.
These are educated hypotheses — clearly label them as such.

Product: ${productIdea || "Not specified"}
Target users: ${targetUsers || "Not specified"}
Problem solved: ${problem || "Not specified"}
Category: ${category}
Segments: ${segments.map((s) => s.name).join(", ")}

Return a JSON object with key "signals" containing an array of 6 items:
{
  "title": "Short descriptive title",
  "snippet": "2-3 sentence realistic user language or insight for this category",
  "sentiment": "positive"|"negative"|"neutral"|"mixed",
  "signalType": "pain_point"|"competitor"|"objection"|"unmet_need"|"language"|"channel",
  "segmentId": <one of: ${segments.map((s) => s.id).join(", ")}>
}

Make signals specific to the product context and realistic — written in actual user voice.`;

  try {
    const resp = await client.chat.completions.create(
      {
        model: "gpt-5-nano",
        max_completion_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      { signal: AbortSignal.timeout(8_000) },
    );
    const content = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { signals?: unknown[] };
    const raw = parsed.signals ?? [];

    const VALID_SENTIMENT = ["positive", "negative", "neutral", "mixed"] as const;
    const VALID_TYPE = ["pain_point", "competitor", "objection", "unmet_need", "language", "channel"] as const;

    return (raw as Array<Record<string, unknown>>).map((item, i) => {
      const sentiment = VALID_SENTIMENT.includes(item.sentiment as typeof VALID_SENTIMENT[number])
        ? item.sentiment as typeof VALID_SENTIMENT[number]
        : "neutral";
      const signalType = VALID_TYPE.includes(item.signalType as typeof VALID_TYPE[number])
        ? item.signalType as typeof VALID_TYPE[number]
        : "pain_point";
      const segmentId = segments.find((s) => s.id === item.segmentId)?.id;

      return {
        id: `signal-hyp-${Date.now()}-${i}`,
        source: "manual" as const,
        query: `${category} hypothesis`,
        title: typeof item.title === "string" ? item.title : "Research hypothesis",
        snippet: typeof item.snippet === "string" ? item.snippet : "",
        sentiment,
        signalType,
        ...(segmentId ? { segmentId } : {}),
        createdAt: new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

/* ─── Step 5: Build evidenceSummary + updatedSegments ───────────── */
function buildResults(
  signals: ResearchSignal[],
  sourceMode: "live_research" | "ai_hypothesis",
  segments: AudienceSegment[],
): { evidenceSummary: EvidenceSummary; updatedSegments: AudienceSegment[] } {
  const urlSignals = signals.filter((s) => s.url);
  const strongestSignals = signals
    .filter((s) => s.signalType === "pain_point" || s.signalType === "unmet_need")
    .slice(0, 5)
    .map((s) => s.snippet.slice(0, 100));

  const evidenceSummary: EvidenceSummary = {
    sourceMode,
    confidenceReason: sourceMode === "live_research"
      ? `${urlSignals.length} source-backed signals collected from public search results.`
      : "No live search results with verifiable URLs were collected. Signals below are AI-generated hypotheses based on product context.",
    totalSignals: signals.length,
    strongestSignals,
    limitations: sourceMode === "live_research"
      ? [
          "Signals are from public search index snippets only — not scraped from Reddit, X, or TikTok.",
          "Validate insights with direct user conversations before making decisions.",
        ]
      : [
          "This is a directional MVP estimate.",
          "Live social and competitor data is not connected yet.",
          "Validate with real user conversations before making decisions.",
        ],
  };

  const updatedSegments: AudienceSegment[] = segments.map((seg) => {
    const segSignals = signals.filter((s) => s.segmentId === seg.id);
    if (segSignals.length === 0) return seg;

    const existingEvidence = seg.evidence;
    const painSignals = segSignals.filter((s) => s.signalType === "pain_point" || s.signalType === "unmet_need");
    const objSignals  = segSignals.filter((s) => s.signalType === "objection");
    const langSignals = segSignals.filter((s) => s.signalType === "language");
    const compSignals = segSignals.filter((s) => s.signalType === "competitor");

    return {
      ...seg,
      evidence: {
        signalStrength: segSignals.length >= 3 ? "High" : segSignals.length >= 1 ? "Medium" : "Low",
        exampleUserLanguage: langSignals.length > 0
          ? langSignals.map((s) => s.snippet.slice(0, 120))
          : (existingEvidence?.exampleUserLanguage ?? []),
        likelySearchQueries: segSignals.map((s) => s.query).filter((q, i, a) => a.indexOf(q) === i).slice(0, 4),
        competitorMentions: compSignals.length > 0
          ? compSignals.map((s) => s.title)
          : (existingEvidence?.competitorMentions ?? []),
        unmetNeeds: painSignals.length > 0
          ? painSignals.map((s) => s.snippet.slice(0, 120))
          : (existingEvidence?.unmetNeeds ?? []),
        objections: objSignals.length > 0
          ? objSignals.map((s) => s.snippet.slice(0, 120))
          : (existingEvidence?.objections ?? []),
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

  /* No AI configured — return honest empty fallback */
  if (!baseURL || !apiKey) {
    const fallback = buildResults([], "ai_hypothesis", segments);
    return {
      sourceMode: "ai_hypothesis",
      signals: [],
      ...fallback,
    };
  }

  const client = new OpenAI({ apiKey, baseURL });

  /* ── Step 1: Generate queries ── */
  const queries = await generateQueries(client, {
    productIdea,
    targetUsers,
    problem,
    category,
    region,
    segmentNames: segments.map((s) => s.name),
    competitorMentions,
  });

  /* ── Step 2: Fetch DuckDuckGo Instant Answer API ── */
  const ddgResults = await Promise.all(queries.map((q) => fetchDdgSignal(q)));
  const rawSignals = queries
    .map((q, i) => ({ query: q, hit: ddgResults[i] }))
    .filter((x): x is { query: string; hit: NonNullable<typeof ddgResults[0]> } => x.hit !== null)
    .map(({ query, hit }) => ({ ...hit, query }));

  const liveSignalCount = rawSignals.length;

  /* ── Step 3: Classify live signals or build hypothesis signals ── */
  let signals: ResearchSignal[];
  let sourceMode: "live_research" | "ai_hypothesis";

  if (liveSignalCount >= 3) {
    signals = await classifySignals(client, rawSignals, segments);
    sourceMode = "live_research";
  } else {
    /* Not enough real URL-backed signals — fall back to AI hypotheses */
    const hypSignals = await buildHypothesisSignals(client, {
      productIdea, targetUsers, problem, category, segments,
    });
    /* Include any real signals we did collect, unlabelled as live_research */
    const classifiedReal = rawSignals.length > 0
      ? await classifySignals(client, rawSignals, segments)
      : [];
    signals = [...classifiedReal, ...hypSignals];
    sourceMode = "ai_hypothesis";
  }

  const { evidenceSummary, updatedSegments } = buildResults(signals, sourceMode, segments);

  return { sourceMode, signals, evidenceSummary, updatedSegments };
}
