# AI JSON Schemas

Version: 1.0

---

# Rule

Every Gemini response MUST follow a strict schema.

Invalid JSON must be rejected.

---

# Vision Response

{
  overallScore: number,
  confidence: number,
  metrics: {
    acne: number,
    hydration: number,
    redness: number,
    pigmentation: number,
    texture: number,
    oiliness: number,
    pores: number,
    wrinkles: number,
    darkCircles: number
  }
}

---

# Historical Comparison

{
  trend: string,
  scoreChange: number,
  improvements: [],
  concerns: [],
  summary: string
}

---

# Daily Insight

{
  title: string,
  summary: string,
  recommendation: string,
  motivation: string
}

---

# Weekly Summary

{
  averageScore: number,
  bestMetric: string,
  improvement: string,
  recommendation: string
}

---

# AI Coach

{
  answer: string,
  followUpQuestions: [],
  disclaimer: string
}

---

# Validation

Use

Zod

Reject

Missing fields

Invalid enums

Out-of-range scores

Malformed JSON

Retry once.

Fail gracefully.