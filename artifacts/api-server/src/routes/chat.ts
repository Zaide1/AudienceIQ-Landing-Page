import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { buildMockResult, type AudienceMapResult } from "../lib/audienceAI";

const router: IRouter = Router();

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

  /* Normalise if off by a small amount */
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

/* ─── Deterministic fallback responses ──────────────────────────── */
const REFINEMENT_KEYWORDS = [
  "priorit", "focus", "shift", "change", "refine", "update", "target", "make",
  "adjust", "rebalance", "move", "increase", "decrease", "drop", "add", "pivot",
];

function isRefinementRequest(msg: string): boolean {
  const lower = msg.toLowerCase();
  return REFINEMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildFallbackAnswer(userMessage: string, map: AudienceMapResult): ChatRefineResponse {
  const seg = map.segments[0];
  return {
    type: "answer",
    message: `Based on your current audience map, ${seg?.name ?? "your top segment"} (${seg?.percent ?? 0}%) is your strongest starting point. ${seg?.acquisitionAngle ?? ""} Focus on validating this segment first before expanding to others.`,
    proposedAudienceMap: null,
    suggestedActions: [
      `Run 5 interviews with ${seg?.name ?? "your top segment"}`,
      "Post one piece of content targeting their top pain point",
      "Track early traction to validate before scaling",
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

  /* Re-normalise */
  const sum = updated.segments.reduce((a, s) => a + s.percent, 0);
  if (sum !== 100) {
    const diff = 100 - sum;
    updated.segments[1]!.percent += diff;
  }

  return {
    type: "proposed_update",
    message: `I've adjusted the audience map to increase focus on ${map.segments[0]?.name ?? "your top segment"}. Review the proposed changes and confirm when you're ready.`,
    proposedAudienceMap: updated,
    suggestedActions: [
      "Confirm to apply the updated map",
      "Ask me why this segment was prioritised",
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
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    const fallback = isRefinementRequest(userMessage)
      ? buildFallbackUpdate(currentAudienceMap)
      : buildFallbackAnswer(userMessage, currentAudienceMap);
    res.json(fallback);
    return;
  }

  try {
    const client = new OpenAI({ apiKey, baseURL });

    /* Recent messages context (last 10, skip system roles) */
    const recentContext = (messages ?? [])
      .filter((m) => m.role === "user" || m.role === "ai")
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Founder" : "Audense"}: ${m.text}`)
      .join("\n");

    const segmentSummary = currentAudienceMap.segments
      .map((s) => `- ${s.name} (${s.percent}%): ${s.painPoints.join(", ")}. Platforms: ${s.platforms.join(", ")}. Angle: ${s.acquisitionAngle}`)
      .join("\n");

    const systemPrompt = `You are Audense, an audience intelligence coach for early-stage founders.
You help founders understand their target audience, decide who to focus on first, and plan outreach.
You are NOT a generic startup chatbot. Every answer must be grounded in the founder's current audience map and onboarding context.
You do not invent official market statistics. Treat audience numbers as directional MVP estimates.
Be practical, specific, and founder-friendly. Avoid vague startup platitudes.

Current research context:
Product: ${onboardingData?.productIdea ?? "Not specified"}
Target users: ${onboardingData?.targetUsers ?? "Not specified"}
Problem: ${onboardingData?.problem ?? "Not specified"}
Goal: ${onboardingData?.goal ?? "Not specified"}
Category: ${currentAudienceMap.category}
Region: ${currentAudienceMap.region}
Confidence: ${currentAudienceMap.confidence}

Audience segments:
${segmentSummary}

Reachable audience estimate: ${currentAudienceMap.reachableAudience.min.toLocaleString()}–${currentAudienceMap.reachableAudience.max.toLocaleString()} people (directional)
Coverage so far: ${currentAudienceMap.coverage.percent}% (${currentAudienceMap.coverage.people.toLocaleString()} people)
Untapped: ${currentAudienceMap.untapped.percent}%

Recent conversation:
${recentContext || "(no previous messages)"}

DECISION RULE — choose exactly one type:

TYPE = "answer" when:
- The founder asks a question: where to find users, what message works, why a segment matters, how to validate, TikTok/LinkedIn/Reddit plan, what to say, why they won't use it, etc.
- The founder asks for advice, ideas, or strategy without asking you to change anything.
- Examples: "Where do I find gym goers?", "Give me a TikTok plan", "Why wouldn't they use my app?", "Who should I target first?"

TYPE = "proposed_update" (with a full proposedAudienceMap) when:
- The founder uses directive language to change the map: "make X the main/primary/lead", "prioritise X", "shift focus to X", "increase X's share", "drop segment X", "rebalance", "update the map", "refine the segments", "focus on X instead".
- The founder names a segment plus a clear directive verb.
- Examples: "Make Busy Professionals the main audience", "Prioritise gym goers", "Shift focus to weight loss beginners", "Update the map to focus on paid users".
- CRITICAL: If your message text says things like "I'd shift the map", "I'd increase X", "I'd prioritise X" — that means you MUST return type "proposed_update", not "answer". Never describe a map change in prose and return type "answer". If you would change the map, DO it.

DO NOT return proposed_update for informational or strategy questions. Most messages (about 70%) should be type "answer".

WHEN returning proposed_update, you MUST include a complete proposedAudienceMap with ALL of these fields:
- productSummary: string
- region: string (copy from current map)
- category: string (copy from current map)
- confidence: "Low" | "Medium" | "High"
- reachableAudience: { min: number, max: number, label: string }
- coverage: { percent: number, people: number }
- untapped: { percent: number, min: number, max: number }
- segments: exactly 5 items, percentages summing to exactly 100, colors MUST be in order: "purple", "blue", "green", "orange", "pink". Each segment needs: id, name, percent, audienceMin, audienceMax, color, painPoints (array), platforms (array), whyThisSegment, acquisitionAngle.
- insights: array of 1–3 { title, description } objects

Return ONLY valid JSON, no markdown, no explanation outside the JSON:
{
  "type": "answer" | "proposed_update",
  "message": "Your response to the founder (1–4 sentences, specific and grounded in their context, no vague platitudes).",
  "proposedAudienceMap": null,
  "suggestedActions": ["specific action 1", "specific action 2", "specific action 3"]
}`;

    const response = await client.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as Record<string, unknown>;

    const type = parsed.type === "proposed_update" ? "proposed_update" : "answer";
    const message = typeof parsed.message === "string" ? parsed.message : "I can help with that — let me know if you'd like more detail.";
    const suggestedActions = Array.isArray(parsed.suggestedActions)
      ? (parsed.suggestedActions as unknown[]).filter((a): a is string => typeof a === "string").slice(0, 4)
      : [];

    let proposedAudienceMap: AudienceMapResult | null = null;
    if (type === "proposed_update" && parsed.proposedAudienceMap) {
      proposedAudienceMap = validateProposedMap(parsed.proposedAudienceMap);
      if (!proposedAudienceMap) {
        /* Validation failed — degrade to answer so we never return invalid map */
        req.log.warn("Proposed map failed validation, degrading to answer");
        res.json({
          type: "answer",
          message,
          proposedAudienceMap: null,
          suggestedActions,
        } satisfies ChatRefineResponse);
        return;
      }
    }

    req.log.info({ type, aiUsed: true }, "chat/refine completed");

    res.json({
      type,
      message,
      proposedAudienceMap,
      suggestedActions,
    } satisfies ChatRefineResponse);
  } catch (err) {
    req.log.error({ err }, "chat/refine AI error — using fallback");
    const fallback = isRefinementRequest(userMessage)
      ? buildFallbackUpdate(currentAudienceMap)
      : buildFallbackAnswer(userMessage, currentAudienceMap);
    res.json(fallback);
  }
});

export default router;
