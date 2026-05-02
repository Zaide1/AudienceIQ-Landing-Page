import { Router } from "express";
import { collectSignals } from "../lib/researchSignals";

const researchRouter = Router();

researchRouter.post("/research/collect-signals", async (req, res) => {
  const { onboardingData, currentAudienceMap } = req.body as {
    onboardingData?: Record<string, string>;
    currentAudienceMap?: unknown;
  };

  if (!currentAudienceMap || typeof currentAudienceMap !== "object") {
    res.status(400).json({ error: "currentAudienceMap is required" });
    return;
  }

  try {
    const result = await collectSignals(
      onboardingData ?? {},
      currentAudienceMap as Parameters<typeof collectSignals>[1],
    );
    req.log.info(
      { sourceMode: result.sourceMode, signals: result.signals.length, urlBacked: result.urlBackedSignalCount },
      "research collect-signals done",
    );
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "research collect-signals failed");
    res.status(500).json({ error: "Research collection failed" });
  }
});

export default researchRouter;
