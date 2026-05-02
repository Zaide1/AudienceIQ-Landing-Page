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

  /* Try AI generation first; fall back to deterministic mock if anything fails */
  const aiResult = await generateAudienceMapWithAI({
    productIdea: productIdea ?? "",
    targetUsers: targetUsers ?? "",
    problem: problem ?? "",
    goal: goal ?? "",
    finalCategory,
    finalRegion,
  });

  const result = aiResult ?? buildMockResult(productIdea ?? "", finalCategory, finalRegion);

  req.log.info(
    { aiUsed: aiResult !== null },
    "audience/generate completed",
  );

  res.json(result);
});

export default router;
