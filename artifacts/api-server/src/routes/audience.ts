import { Router, type IRouter } from "express";
import {
  CATEGORY_LABELS,
  REGION_LABELS,
  REGION_REACH,
  resolveTemplate,
} from "../lib/audienceTemplates";

const router: IRouter = Router();

router.post("/audience/generate", (req, res) => {
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

  const regionLabel = REGION_LABELS[finalRegion] ?? finalRegion;
  const [reachMin, reachMax] = REGION_REACH[finalRegion] ?? [500_000, 900_000];
  const categoryLabel = CATEGORY_LABELS[finalCategory] ?? finalCategory;
  const templates = resolveTemplate(finalCategory);

  const coveragePct = 7;
  const coveragePeople = Math.round(reachMin * (coveragePct / 100));
  const untappedPct = 100 - coveragePct;
  const untappedMin = Math.round(reachMin * (untappedPct / 100));
  const untappedMax = Math.round(reachMax * (untappedPct / 100));

  const segments = templates.map((t) => ({
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
  }));

  const productSummary = productIdea?.trim() || targetUsers?.trim() || "Your product";

  const result = {
    productSummary,
    region: regionLabel,
    category: categoryLabel,
    confidence: "Medium" as const,
    reachableAudience: {
      min: reachMin,
      max: reachMax,
      label: `people in ${regionLabel}`,
    },
    coverage: {
      percent: coveragePct,
      people: coveragePeople,
    },
    untapped: {
      percent: untappedPct,
      min: untappedMin,
      max: untappedMax,
    },
    segments,
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

  res.json(result);
});

export default router;
