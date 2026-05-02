import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { type AudienceMapResult, calculateCoverageEstimate, recalculateCoverageFields } from "../lib/audienceAI";

const router: IRouter = Router();

/* ─── Constants ──────────────────────────────────────────────────── */
const AI_TIMEOUT_MS  = 13_000;
const MAX_TOKENS     = 1200;
const MAX_ACTIONS    = 4;
const MAX_ACTION_LEN = 40;

/* ─── Types ──────────────────────────────────────────────────────── */
interface ChatMessage {
  role: string;
  text: string;
}

interface ChatRefineRequest {
  onboardingData: {
    productIdea?: string;
    targetUsers?: string;
    problem?: string;
    goal?: string;
    finalCategory?: string;
    finalRegion?: string;
  };
  currentAudienceMap: AudienceMapResult;
  messages: ChatMessage[];
  userMessage: string;
}

interface ChatRefineResponse {
  type: "answer" | "proposed_update";
  message: string;
  proposedAudienceMap: AudienceMapResult | null;
  suggestedActions: string[];
}

/* ─── Out-of-scope classifier ────────────────────────────────────── */
/*
 * These patterns match clearly out-of-scope requests.
 * Each regex is checked against the full userMessage (case-insensitive).
 * A separate audience-framing override lets through messages that are
 * obviously about product/audience research even if they touch a
 * sensitive domain (e.g. "My app helps GLP-1 users — who should I target?").
 */

const OOS_MEDICAL = /\b(should i prescribe|prescrib(e|ing|ed) (?:this|it|them)|glp.?1 safety|ozempic safety|semaglutide safety|is (?:this|it) safe to (take|use)|dosage (?:of|for) \w+|drug interaction|contraindication|clinical trial result|medical advice|treatment plan|diagnos[ei]s? (?:of|for)|my patient (asked|needs|has)|as a (doctor|physician|nurse|clinician))\b/i;

const OOS_LEGAL = /\b(legal advice|should i sue|am i liable|can they sue me|statute of limitations|habeas corpus|attorney advice|lawyer advice)\b/i;

const OOS_FINANCIAL = /\b(should i invest in|which stocks? (to|should)|stock pick|crypto advice|financial advice|investment advice|tax advice for me)\b/i;

const OOS_GENERAL = /\b(write my essay|do my homework|explain (?:photosynthesis|evolution|quantum mechanics|general relativity) (?:to me|for me)|what is the capital of|history of (?:world war|the roman|ancient))\b/i;

type OOSCategory = "medical" | "legal" | "financial" | "general";

/*
 * If a message contains out-of-scope patterns BUT is clearly framed as
 * product/audience research, the audience framing takes priority → allowed.
 */
const AUDIENCE_FRAMING = [
  /\b(my product|our product|my app|our app|my startup|my business|my service|my platform|my tool)\b/i,
  /\b(who should i target|who (is|are) (the |my )?(audience|users?|customers?)|target audience|ideal user)\b/i,
  /\b(audience (for|of|segment)|user segment|customer segment|market (for|of)|who would (use|buy|pay for))\b/i,
  /\b(pain point|user objection|messaging angle|acquisition channel|how do i reach|where (are|do i find) (my|the))\b/i,
  /\b(tracking app|adherence app|health app|wellness app|fitness app|mental health app|what (worries|concerns) (my )?users)\b/i,
];

function classifyOOS(msg: string): OOSCategory | null {
  let category: OOSCategory | null = null;
  if (OOS_MEDICAL.test(msg))   category = "medical";
  else if (OOS_LEGAL.test(msg))     category = "legal";
  else if (OOS_FINANCIAL.test(msg)) category = "financial";
  else if (OOS_GENERAL.test(msg))   category = "general";

  if (!category) return null;

  /* Audience research framing overrides the block */
  const hasAudienceFraming = AUDIENCE_FRAMING.some((p) => p.test(msg));
  return hasAudienceFraming ? null : category;
}

/* ─── Out-of-scope redirect response ────────────────────────────── */
function productContext(body: ChatRefineRequest): string {
  const ctx =
    body.currentAudienceMap?.productSummary?.trim() ||
    body.onboardingData?.productIdea?.trim();
  return ctx && ctx.length > 0 ? ctx : "your product";
}

function buildOOSResponse(ctx: string, category: OOSCategory): ChatRefineResponse {
  const domain =
    category === "medical"   ? "medical" :
    category === "legal"     ? "legal" :
    category === "financial" ? "finance" :
    "general-purpose";

  return {
    type: "answer",
    message: `Not my lane — I'm an audience coach, not a ${domain} advisor. I'm here to help map who wants ${ctx}, where they are, and how to reach them. What do you want to know about your audience?`,
    proposedAudienceMap: null,
    suggestedActions: [],
  };
}

/* ─── Colour enforcement ─────────────────────────────────────────── */
const COLORS = ["purple", "blue", "green", "orange", "pink"] as const;

function enforceColors(map: AudienceMapResult): AudienceMapResult {
  return {
    ...map,
    segments: map.segments.map((s, i) => ({ ...s, color: COLORS[i]! })),
  };
}

/* ─── Validate a proposed map from AI ───────────────────────────── */
function validateProposedMap(raw: unknown): AudienceMapResult | null {
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
  if (!Array.isArray(r.insights) || r.insights.length < 1) return null;

  let pctSum = 0;
  const segments = [];
  for (let i = 0; i < 5; i++) {
    const s = r.segments[i] as Record<string, unknown>;
    if (!s || typeof s.id !== "string" || typeof s.name !== "string") return null;
    if (typeof s.percent !== "number" || typeof s.audienceMin !== "number" || typeof s.audienceMax !== "number") return null;
    if (!Array.isArray(s.painPoints) || !Array.isArray(s.platforms)) return null;
    if (typeof s.whyThisSegment !== "string" || typeof s.acquisitionAngle !== "string") return null;
    pctSum += s.percent;
    segments.push({ ...s, color: COLORS[i]! });
  }

  if (Math.abs(pctSum - 100) > 5) return null;

  if (pctSum !== 100) {
    const scale = 100 / pctSum;
    let rem = 100;
    for (let i = 0; i < segments.length - 1; i++) {
      segments[i]!.percent = Math.round((segments[i]!.percent as number) * scale);
      rem -= segments[i]!.percent as number;
    }
    segments[4]!.percent = rem;
  }

  const insights = (r.insights as Array<Record<string, unknown>>).slice(0, 3).map((ins) => ({
    title: String(ins.title ?? "Insight"),
    description: String(ins.description ?? ""),
  }));

  /* Validate coverage range and always recalculate derived fields */
  const rawCovPct = cov.percent as number;
  const validCovPct = rawCovPct >= 3 && rawCovPct <= 28
    ? rawCovPct
    : calculateCoverageEstimate({ category: r.category as string, sourceMode: "ai_hypothesis", segments: segments as Array<{ percent: number }> });
  const { coverage: covField, untapped: untField } = recalculateCoverageFields(
    validCovPct,
    ra.min as number,
    ra.max as number,
  );

  return {
    productSummary: r.productSummary,
    region: r.region,
    category: r.category,
    confidence: r.confidence as "Low" | "Medium" | "High",
    reachableAudience: { min: ra.min as number, max: ra.max as number, label: ra.label as string },
    coverage: covField,
    untapped: untField,
    segments: segments as AudienceMapResult["segments"],
    insights,
  };
}

/* ─── Helpers ────────────────────────────────────────────────────── */
const REFINEMENT_KEYWORDS = [
  "priorit", "focus", "shift", "change", "refine", "update", "target", "make",
  "adjust", "rebalance", "move", "increase", "decrease", "drop", "add", "pivot",
];

function isRefinementRequest(msg: string): boolean {
  return REFINEMENT_KEYWORDS.some((kw) => msg.toLowerCase().includes(kw));
}

function cleanActions(raw: unknown[]): string[] {
  return raw
    .filter((a): a is string => typeof a === "string")
    .slice(0, MAX_ACTIONS)
    .map((a) => a.length > MAX_ACTION_LEN ? a.slice(0, MAX_ACTION_LEN - 1) + "…" : a);
}

/* ─── Deterministic fallbacks ────────────────────────────────────── */
function buildFallbackAnswer(map: AudienceMapResult): ChatRefineResponse {
  const seg = map.segments[0];
  return {
    type: "answer",
    message: `Start with ${seg?.name ?? "your top segment"} (${seg?.percent ?? 0}%). ${seg?.acquisitionAngle ?? ""}`,
    proposedAudienceMap: null,
    suggestedActions: [
      `Interview 5 ${seg?.name ?? "users"}`,
      "Post on their top platform",
      "Measure response in 7 days",
    ],
  };
}

function buildFallbackUpdate(map: AudienceMapResult): ChatRefineResponse {
  const updated = enforceColors({
    ...map,
    segments: map.segments.map((s, i) => ({
      ...s,
      percent: i === 0 ? Math.min(s.percent + 5, 40)
        : i === 1 ? Math.max(s.percent - 3, 5)
        : i === 4 ? Math.max(s.percent - 2, 5)
        : s.percent,
    })),
  });

  const sum = updated.segments.reduce((a, s) => a + s.percent, 0);
  if (sum !== 100) updated.segments[1]!.percent += 100 - sum;

  return {
    type: "proposed_update",
    message: `Boosted ${map.segments[0]?.name ?? "top segment"} to ${updated.segments[0]!.percent}%. Confirm to apply.`,
    proposedAudienceMap: updated,
    suggestedActions: ["Confirm update", "Ask why this was prioritised"],
  };
}

/* ─── Main route ─────────────────────────────────────────────────── */
router.post("/chat/refine", async (req, res) => {
  const body = req.body as ChatRefineRequest;
  const { onboardingData, currentAudienceMap, messages, userMessage } = body;

  if (!userMessage?.trim()) {
    res.status(400).json({ error: "userMessage is required" });
    return;
  }

  /* ── Out-of-scope guard (no AI call needed) ───────────────────── */
  const oosCategory = classifyOOS(userMessage);
  if (oosCategory) {
    req.log.info({ blocked: oosCategory }, "chat/refine OOS blocked");
    res.json(buildOOSResponse(productContext(body), oosCategory));
    return;
  }

  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    const fallback = isRefinementRequest(userMessage)
      ? buildFallbackUpdate(currentAudienceMap)
      : buildFallbackAnswer(currentAudienceMap);
    res.json(fallback);
    return;
  }

  /* ── Abort controller for 13s timeout ────────────────────────── */
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const client = new OpenAI({ apiKey, baseURL });

    const recentContext = (messages ?? [])
      .filter((m) => m.role === "user" || m.role === "ai")
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Founder" : "Audense"}: ${m.text}`)
      .join("\n");

    const segmentSummary = currentAudienceMap.segments
      .map((s) => `- ${s.name} (${s.percent}%): ${s.painPoints.slice(0, 2).join(", ")}. Platforms: ${s.platforms.slice(0, 2).join(", ")}. Angle: ${s.acquisitionAngle}`)
      .join("\n");

    const productCtx = productContext(body);

    const sourceMode   = currentAudienceMap.evidenceSummary?.sourceMode ?? "mock";
    const sourcesUsed  = currentAudienceMap.evidenceSummary?.sourcesUsed ?? [];
    const usedHN       = sourcesUsed.includes("hacker_news");
    const category     = currentAudienceMap.category ?? "";
    const isTechCat    = ["developer", "saas", "ai", "b2b", "software", "fintech", "edtech", "productivity", "analytics"]
      .some((t) => category.toLowerCase().includes(t));

    const evidenceNote = sourceMode === "live_research"
      ? usedHN
        ? `This map is backed by live public Hacker News discussion signals (${currentAudienceMap.evidenceSummary?.totalSignals ?? 0} signals). ${isTechCat ? "HN is well-suited for this technical category." : "Note: HN skews toward tech/startup audiences — treat these as partial evidence for a mainstream consumer product."}`
        : "This map is backed by live research signals."
      : `This map is based on ${sourceMode === "ai_hypothesis" ? "AI-generated hypotheses" : "directional mock estimates"} — no live Reddit, X/Twitter, TikTok, YouTube, or competitor data has been read yet.`;

    const evidenceContext = currentAudienceMap.segments
      .filter((s) => s.evidence)
      .map((s) => {
        const ev = s.evidence!;
        return `${s.name}: needs="${ev.unmetNeeds.slice(0, 2).join("; ")}" | objections="${ev.objections.slice(0, 2).join("; ")}"`;
      })
      .join("\n");

    const systemPrompt = `You are Audense, a sharp audience intelligence coach for early-stage founders.
Be concise, specific, and practical. Ground every answer in the founder's current audience map.
Never invent statistics. Treat audience numbers as directional MVP estimates.
No emojis. No robotic filler. Short, punchy, founder-friendly.

CONTEXT:
Product: ${onboardingData?.productIdea ?? "Not specified"}
Target users: ${onboardingData?.targetUsers ?? "Not specified"}
Category: ${currentAudienceMap.category} | Region: ${currentAudienceMap.region} | Confidence: ${currentAudienceMap.confidence}

Segments:
${segmentSummary}

Reach: ${currentAudienceMap.reachableAudience.min.toLocaleString()}–${currentAudienceMap.reachableAudience.max.toLocaleString()} | Coverage: ${currentAudienceMap.coverage.percent}% | Untapped: ${currentAudienceMap.untapped.percent}%
${evidenceContext ? `\nEvidence signals (hypotheses):\n${evidenceContext}` : ""}

Recent conversation:
${recentContext || "(none)"}

═══ EVIDENCE HONESTY ═══
${evidenceNote}
If the user asks what people are saying on Reddit, X, TikTok, YouTube, or competitor pages — be honest:
- If sourceMode is NOT "live_research", say these are directional hypotheses to validate, NOT verified live findings.
- You may use the evidence fields (unmetNeeds, objections, exampleUserLanguage) to give useful answers, but frame them as "based on what typically happens in this category" or "here's what to look for" — not as verified quotes or scraped data.
- Never claim to have read live social data, reviews, or competitor pages unless sourceMode is "live_research".
- If sourceMode IS "live_research" and sourcesUsed includes "hacker_news":
  - You MAY say "Based on live Hacker News / public tech discussion signals..."
  - You MUST NOT say "People on Reddit/TikTok/X are saying..." — those sources are not connected.
  - If the product is non-technical/consumer, add: "These are from tech startup discussions, so treat them as partial evidence — validate with sources closer to your real audience."

═══ SCOPE GUARDRAILS ═══
You are an audience intelligence coach only. You cannot and will not provide:
- Medical, clinical, or drug safety advice (even if the user is a doctor or healthcare professional)
- Legal or regulatory advice
- Financial, investment, or tax advice
- General factual answers with no connection to the current product/audience
- Personal life advice

NUANCE — grey-area framing:
If the user asks about a sensitive topic but frames it clearly as audience/product research
(e.g. "What pain points do GLP-1 users have about an adherence app?" or
"What objections would mental health app users have?"), you MAY answer — focus on
audience insights, not professional advice.

If a question is clearly out of scope, return this exact JSON:
{
  "type": "answer",
  "message": "Not my lane — I'm an audience coach, not a [medical/legal/finance] advisor. I'm here to help map who wants ${productCtx}, where they are, and how to reach them. What do you want to know about your audience?",
  "proposedAudienceMap": null,
  "suggestedActions": []
}
Replace [medical/legal/finance] with the relevant domain. Use "general-purpose" for off-topic questions.

═══ ANSWER FORMAT (type "answer") ═══
ONE sentence: your single best recommendation.
Then 3–5 bullets (≤ 15 words each, no sub-bullets).
Total message: under 150 words. No essays, no ranked paragraphs, no preamble.

═══ UPDATE FORMAT (type "proposed_update") ═══
message: 2–3 sentences max. Say what changed and why. End with "Confirm to apply."
proposedAudienceMap: full map with all required fields (see below).

═══ DECISION: which type to use ═══
"answer" — founder asks a question, wants advice, strategy, or a plan (≈ 70% of messages).
Examples: "Where do I find them?", "Give me a TikTok plan", "Why won't they convert?", "Who should I target first?"

"proposed_update" — founder uses a clear directive to change the map: "make X the main", "prioritise X", "shift focus to X", "rebalance", "increase X's share", "drop X", "focus on X instead".
CRITICAL: If your answer text would say "I'd shift the map" or "I'd prioritise X" — you MUST produce proposed_update, not an essay. Do it, don't describe it.

═══ proposedAudienceMap SCHEMA (only for proposed_update) ═══
Required fields: productSummary, region, category, confidence ("Low"|"Medium"|"High"),
reachableAudience {min,max,label}, coverage {percent,people}, untapped {percent,min,max},
segments (exactly 5, pct sum = 100, colors in order: purple,blue,green,orange,pink,
  each: id,name,percent,audienceMin,audienceMax,color,painPoints[],platforms[],whyThisSegment,acquisitionAngle),
insights (1–3 × {title,description}).

═══ suggestedActions ═══
2–4 items. Each ≤ 40 characters. No articles or filler words.
If out-of-scope: return suggestedActions as [].

Return ONLY valid JSON (no markdown, no text outside JSON):
{"type":"answer|proposed_update","message":"…","proposedAudienceMap":null,"suggestedActions":["…"]}`;

    const response = await client.chat.completions.create(
      {
        model: "gpt-5.4",
        max_completion_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      },
      { signal: controller.signal },
    );

    clearTimeout(timer);

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as Record<string, unknown>;

    const type = parsed.type === "proposed_update" ? "proposed_update" : "answer";
    const message = typeof parsed.message === "string"
      ? parsed.message
      : "I can help with that — ask me anything about your audience.";
    const suggestedActions = Array.isArray(parsed.suggestedActions)
      ? cleanActions(parsed.suggestedActions as unknown[])
      : [];

    let proposedAudienceMap: AudienceMapResult | null = null;
    if (type === "proposed_update" && parsed.proposedAudienceMap) {
      proposedAudienceMap = validateProposedMap(parsed.proposedAudienceMap);
      if (!proposedAudienceMap) {
        req.log.warn("Proposed map failed validation — degrading to answer");
        res.json({ type: "answer", message, proposedAudienceMap: null, suggestedActions } satisfies ChatRefineResponse);
        return;
      }
    }

    req.log.info({ type, aiUsed: true }, "chat/refine OK");
    res.json({ type, message, proposedAudienceMap, suggestedActions } satisfies ChatRefineResponse);

  } catch (err: unknown) {
    clearTimeout(timer);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    req.log.warn({ timeout: isTimeout, err }, "chat/refine fallback");
    const fallback = isRefinementRequest(userMessage)
      ? buildFallbackUpdate(currentAudienceMap)
      : buildFallbackAnswer(currentAudienceMap);
    res.json(fallback);
  }
});

export default router;
