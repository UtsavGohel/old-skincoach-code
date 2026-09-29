// docs/06 Confidence Rules: >90% show normally · 70–90% moderate · <70% recommend
// retaking · <50% reject. The Results screen surfaces this so a low-confidence scan is
// never presented as fact (AI safety, docs/06). Required by docs/19 (the mockup omits
// any confidence indicator).
export type ConfidenceLevel = 'high' | 'moderate' | 'retake' | 'reject';

export type ConfidenceTier = {
  level: ConfidenceLevel;
  label: string;
  description: string;
  /** retake/reject should nudge the user to scan again. */
  suggestRetake: boolean;
};

export function getConfidenceTier(confidence: number): ConfidenceTier {
  const pct = confidence * 100;

  if (pct < 50) {
    return {
      level: 'reject',
      label: 'Analysis unreliable',
      description:
        "We couldn't read this photo clearly enough. Please retake it in good lighting.",
      suggestRetake: true,
    };
  }
  if (pct < 70) {
    return {
      level: 'retake',
      label: 'Low confidence',
      description:
        'Consider retaking your photo in better lighting for more accurate results.',
      suggestRetake: true,
    };
  }
  if (pct < 90) {
    return {
      level: 'moderate',
      label: 'Moderate confidence',
      description:
        'Lighting or angle slightly reduced accuracy, but your results are still useful.',
      suggestRetake: false,
    };
  }
  return {
    level: 'high',
    label: 'High confidence',
    description: 'This analysis is highly reliable.',
    suggestRetake: false,
  };
}
