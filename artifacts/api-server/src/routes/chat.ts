import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { type AudienceMapResult } from "../lib/audienceAI";

const router: IRouter = Router();

/* ─── Constants ──────────────────────────────────────────────────── */
const AI_TIMEOUT_MS  = 13_000;
const MAX_TOKENS     = 1200;   /* ~150 words answer + JSON overhead + proposed_update map room */
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

  /* Normalise if slightly off */
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

  return {
    productSummary: r.productSummary,
    region: r.region,
    category: r.category,
    confidence: r.confidence as "Low" | "Medium" | "High",
    reachableAudience: { min: ra.min as number, max: ra.max as number, label: ra.label as string },
    coverage: { percent: cov.percent as number, people: cov.people as number },
    untapped: { percent: unt.percent as number, min: unt.min as number, max: unt.max as number },
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

/** Trim suggestedActions to spec: max 4, max 40 chars each */
function cleanActions(raw: unknown[]): string[] {
  return raw
    .filter((a): a is string => typeof a === "string")
    .slice(0, MAX_ACTIONS)
    .map((a) => a.length > MAX_ACTION_LEN ? a.slice(0, MAX_ACTION_LEN - 1) + "…" : a);
}

/* ─── Deterministic fallbacks (concise) ─────────────────────────── */
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
    suggestedActions: [
      "Confirm update",
      "Ask why this was prioritised",
    ],
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

  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    const fallback = isRefinementRequest(userMessage)
      ? buildFallbackUpdate(currentAudienceMap)
      : buildFallbackAnswer(currentAudienceMap);
    res.json(fallback);
    return;
  }

  /* Abort controller for the 13s timeout */
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const client = new OpenAI({ apiKey, baseURL });

    /* Context blocks */
    const recentContext = (messages ?? [])
      .filter((m) => m.role === "user" || m.role === "ai")
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Founder" : "Audense"}: ${m.text}`)
      .join("\n");

    const segmentSummary = currentAudienceMap.segments
      .map((s) => `- ${s.name} (${s.percent}%): ${s.painPoints.slice(0, 2).join(", ")}. Platforms: ${s.platforms.slice(0, 2).join(", ")}. Angle: ${s.acquisitionAngle}`)
      .join("\n");

    const systemPrompt = `You are Audense, a sharp audience intelligence coach for early-stage founders.
Be concise, specific, and practical. Ground every answer in the founder's current audience map.
Never invent statistics. Treat audience numbers as directional MVP estimates.

CONTEXT:
Product: ${onboardingData?.productIdea ?? "Not specified"}
Target users: ${onboardingData?.targetUsers ?? "Not specified"}
Category: ${currentAudienceMap.category} | Region: ${currentAudienceMap.region} | Confidence: ${currentAudienceMap.confidence}

Segments:
${segmentSummary}

Reach: ${currentAudienceMap.reachableAudience.min.toLocaleString()}–${currentAudienceMap.reachableAudience.max.toLocaleString()} | Coverage: ${currentAudienceMap.coverage.percent}% | Untapped: ${currentAudienceMap.untapped.percent}%

Recent conversation:
${recentContext || "(none)"}

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
