# AI Analysis Flow

# SkinCoach

Version: 1.0

AI Engine

Gemini 2.5 Flash Vision (MVP)

Future

Custom Vision Models

---

# Overview

The AI Analysis Engine is the heart of SkinCoach.

Its responsibility is NOT simply detecting acne.

Instead, it should understand the user's skin over time and generate personalized insights based on historical progress.

Every scan follows the exact same pipeline.

The AI must always return structured JSON.

Natural language summaries are generated separately.

---

# High Level Flow

```text
User Opens Camera

↓

Capture Selfie

↓

Quality Validation

↓

Upload Image

↓

Create Scan Record

↓

Gemini Vision Analysis

↓

Structured JSON Response

↓

Backend Validation

↓

Historical Comparison

↓

Insight Generation

↓

Save Results

↓

Return Results
```

---

# Step 1 — Capture Image

Requirements

• Front camera

• Portrait

• Face centered

• Neutral expression

• No filters

• Good lighting

• No sunglasses

Minimum Resolution

1080 × 1080

Format

JPEG

Maximum Size

8 MB

---

# Step 2 — Image Quality Validation

Before calling Gemini, validate:

✓ Face detected

✓ Single face

✓ Face occupies ~60–80% of frame

✓ Eyes visible

✓ Brightness acceptable

✓ Blur acceptable

✓ Image resolution sufficient

If validation fails:

Return guidance.

Example:

Improve lighting

Move closer

Center your face

Remove sunglasses

Retake photo

Do NOT call Gemini for invalid images.

---

# Step 3 — Upload

Image uploads directly to Cloudflare R2.

Backend stores:

Image URL

Thumbnail URL

Metadata

Create

Scan Status

Processing

---

# Step 4 — Prepare AI Context

Backend gathers:

Current selfie

Previous scan

Previous analysis

Skin profile

Skin type

Primary goal

Age

Gender (optional)

Current routine

Recent progress

This context is passed to Gemini.

Gemini should NEVER analyze today's image without historical context when available.

---

# Step 5 — Gemini Vision Analysis

Input

Today's selfie

Historical summary

Skin profile

AI Prompt

Gemini returns ONLY structured JSON.

No markdown.

No explanations.

No extra text.

---

# Required Analysis

Overall Skin Score

Acne

Hydration

Redness

Pigmentation

Texture

Oiliness

Pores

Wrinkles

Dark Circles

Visible Irritation

Confidence Score

Lighting Confidence

Face Detection Confidence

---

# JSON Response

```json
{
  "overallScore": 84,
  "confidence": 0.96,

  "metrics": {
    "acne": {
      "score": 18,
      "severity": "Low"
    },
    "hydration": {
      "score": 82,
      "status": "Good"
    },
    "redness": {
      "score": 12,
      "severity": "Low"
    },
    "pigmentation": {
      "score": 35
    },
    "texture": {
      "score": 80
    },
    "oiliness": {
      "score": 40
    },
    "pores": {
      "score": 30
    },
    "wrinkles": {
      "score": 10
    },
    "darkCircles": {
      "score": 24
    }
  }
}
```

---

# Step 6 — Backend Validation

Validate

Required fields

Numeric ranges

Confidence values

Missing properties

Invalid enums

If invalid

Retry once.

If still invalid

Mark scan as failed.

Never expose malformed AI responses.

---

# Step 7 — Historical Comparison

Compare

Today

↓

Yesterday

↓

7 Days

↓

30 Days

↓

Lifetime

Calculate

Score Difference

Hydration Trend

Acne Trend

Redness Trend

Pigmentation Trend

Texture Trend

Routine Completion %

Streak

These calculations are done by the backend.

Not Gemini.

---

# Step 8 — AI Insight Generation

Second LLM call.

Input

Today's metrics

Historical trends

Routine data

Goal

Generate

Summary

Recommendation

Positive change

Attention area

Next action

Tone

Friendly

Supportive

Never alarming.

---

# Example Insight

Great progress today.

Your hydration has improved steadily over the past week.

Continue using your moisturizer and don't skip sunscreen today.

---

# Step 9 — Save Results

Store

Image

Analysis

Metrics

Insights

Processing Time

AI Version

Prompt Version

Confidence

Everything becomes immutable.

Never overwrite historical scans.

---

# Step 10 — Return Results

Return

Skin Score

Metrics

Insight

Recommendations

Trend

Timeline Update

Achievement Updates

---

# Confidence Rules

Above 90%

Show normally.

70–90%

Show

Moderate Confidence

Below 70%

Recommend retaking photo.

Below 50%

Reject analysis.

---

# AI Safety Rules

Never diagnose diseases.

Never identify medical conditions.

Never claim certainty.

Never recommend prescription medicine.

Never replace a dermatologist.

Always use supportive language.

---

# Prompt Versioning

Every analysis stores

vision_model

vision_prompt_version

insight_prompt_version

Allows future improvements without breaking history.

---

# Retry Strategy

Gemini Timeout

Retry once.

Invalid JSON

Retry once.

Upload Failed

Retry upload.

Database Failed

Retry save.

Maximum

2 retries.

---

# Logging

Track

Processing Time

Model Version

Confidence

Failures

Retry Count

Average Latency

---

# Future Improvements

Multiple-angle scans

Video skin analysis

Custom fine-tuned model

Product effectiveness prediction

Weather-aware analysis

Sleep correlation

Water intake correlation

Hormonal cycle correlation

---

# AI Principles

Always compare with history.

Always explain improvements.

Always encourage consistency.

Never scare users.

Never overpromise.

The AI should feel like a trusted personal skin coach, not a dermatologist.

---

# Success Criteria

A successful analysis should answer:

1. How does my skin look today?

2. Is it improving?

3. Why did it change?

4. What should I do next?

If these four questions are answered clearly, the AI analysis is successful.