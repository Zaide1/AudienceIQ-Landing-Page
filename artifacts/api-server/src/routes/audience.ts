import { Router, type IRouter } from "express";
import { generateAudienceMapWithAI, buildMockResult } from "../lib/audienceAI";

const router: IRouter = Router();

router.post("/audience/generate", async (req, res) => {
  const {
    productIdea,
    targetUsers,
    problem,
    goal,
    finalCategory,
    finalRegion,
  } = req.body as Record<string, string>;

  if (!finalCategory || !finalRegion) {
    res.status(400).json({ error: "finalCategory and finalRegion are required" });
    return;
  }

  /* Try AI generation first; fall back to deterministic, product-aware mock if anything fails. */
  const { map, meta } = await generateAudienceMapWithAI({
    productIdea: productIdea ?? "",
    targetUsers: targetUsers ?? "",
    problem: problem ?? "",
    goal: goal ?? "",
    finalCategory,
    finalRegion,
  });

  const result = map ?? buildMockResult({
    productIdea: productIdea ?? "",
    targetUsers: targetUsers ?? "",
    problem: problem ?? "",
    goal: goal ?? "",
    finalCategory,
    finalRegion,
  });

  /* Internal-only diagnostics. Not exposed to the client. */
  const compNames = result.competitors
    ? [
        ...result.competitors.direct.map((c) => c.name),
        ...result.competitors.adjacent.map((c) => c.name),
        ...result.competitors.substitutes.map((c) => c.name),
      ]
    : [];
  req.log.info(
    {
      aiUsed: meta.aiUsed,
      fallbackReason: map ? null : (meta.fallbackReason ?? "unknown"),
      model: meta.model,
      durationMs: meta.durationMs,
      category: finalCategory,
      region: finalRegion,
      productIdea: productIdea?.slice(0, 80),
      segmentNames: result.segments.map((s) => s.name),
      competitorSource: meta.competitorSource ?? "fallback",
      competitorNames: compNames,
      rejectedCompetitors: meta.rejectedCompetitors ?? [],
    },
    "audience/generate completed",
  );

  res.json(result);
});

export default router;
