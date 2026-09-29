# App Flow Document

# SkinCoach

Version: 1.0

---

# Purpose

This document defines the complete navigation flow of SkinCoach.

Every screen transition, edge case, and navigation path should follow this document.

The goal is to ensure a consistent and intuitive user experience while keeping navigation predictable and production-ready.

---

# Primary Navigation Flow

```text
Splash
    ↓
Welcome
    ↓
Authentication
    ↓
Basic Information
    ↓
Skin Profile & Goals
    ↓
Home Dashboard
```

After onboarding, users always land on the Home Dashboard.

---

# First-Time User Flow

```text
App Launch

↓

Splash

↓

Welcome

↓

Login / Sign Up

↓

Basic Information

↓

Skin Profile & Goals

↓

Home Dashboard

↓

(Optional)
First Daily Scan
```

After completing onboarding, users should never see the Welcome screens again.

---

# Returning User Flow

```text
App Launch

↓

Splash

↓

Home Dashboard
```

If authentication expires:

```text
Splash

↓

Authentication

↓

Home Dashboard
```

---

# Bottom Navigation

Every authenticated screen should contain the Bottom Navigation.

```text
Home

Scan

Progress

Routine

Profile
```

Settings are opened from Profile.

---

# Home Dashboard Flow

```text
Home Dashboard

├── Scan Today
│      ↓
│  Scan Guidelines
│      ↓
│  Camera
│      ↓
│  AI Analysis
│      ↓
│  Analysis Complete
│      ↓
│  Results
│
├── View Progress
│      ↓
│  Progress
│
├── Today's Routine
│      ↓
│  Routine Tracker
│
├── Today's AI Insight
│      ↓
│  AI Coach
│
└── Profile
       ↓
    Profile
```

---

# Scan Flow

```text
Home

↓

Scan Today

↓

Scan Guidelines

↓

Camera

↓

AI Analyzing

↓

Analysis Complete

↓

Results

↓

Home Dashboard
```

After viewing Results, users may navigate to:

```text
Results

├── Progress
├── Home
├── Routine
└── Share Results
```

---

# Progress Flow

```text
Home

↓

Progress

↓

View Timeline

↓

Open Previous Scan

↓

Results

↓

Back to Progress
```

Users can revisit any previous scan.

---

# Routine Flow

```text
Home

↓

Routine

↓

Morning Routine

↓

Night Routine

↓

Routine Completed

↓

Home Dashboard
```

Completing all tasks updates:

- Daily Progress
- Routine Streak
- Home Dashboard

---

# AI Coach Flow

```text
Home

↓

AI Coach

├── Today's Insights

├── Recommendations

├── Ask AI

└── Educational Articles
```

Chat history remains available.

---

# Profile Flow

```text
Home

↓

Profile

├── Achievements

├── Personal Skin Profile

├── Subscription

└── Settings
```

---

# Settings Flow

```text
Profile

↓

Settings

├── Account

├── Notifications

├── Privacy

├── Appearance

├── Language

├── Subscription

└── Support
```

---

# Daily User Journey

```text
Open App

↓

Home Dashboard

↓

Review Today's Skin

↓

Take Daily Scan

↓

Receive Results

↓

Read AI Insights

↓

Complete Routine

↓

Close App
```

Ideal session time:

2–5 minutes.

---

# First Scan Journey

```text
Home Dashboard

↓

Tap Scan

↓

Guidelines

↓

Camera

↓

AI Analysis

↓

Analysis Complete

↓

Results

↓

Progress

↓

Return Home
```

---

# Returning Daily Scan

```text
Home Dashboard

↓

Scan Today

↓

Camera

↓

AI Analysis

↓

Results

↓

Home Dashboard
```

Skip Guidelines after the first successful scan.

Provide an option in Settings to re-enable them.

---

# Error Flow

## No Internet

```text
User Starts Scan

↓

Connection Lost

↓

Friendly Error Screen

↓

Retry

↓

Camera
```

---

## AI Processing Failed

```text
Analyzing

↓

Unable to Analyze

↓

Retry

or

Use Another Photo
```

Never lose the captured image until the user exits.

---

## Face Not Detected

Remain on Camera Screen.

Display guidance:

- Improve lighting
- Center face
- Remove glasses if possible
- Keep neutral expression

Auto-capture resumes once all conditions are met.

---

# Empty States

## Home

No scans yet.

Show:

Start Your First Skin Scan

---

## Progress

No history.

Show:

Your progress will appear after your first scan.

---

## Routine

No routine created.

Show:

Create Your Routine

---

## AI Coach

No previous analysis.

Show:

Complete your first scan to unlock personalized coaching.

---

# Subscription Flow

```text
Free User

↓

Attempts Premium Feature

↓

Subscription Screen

↓

Purchase

↓

Return to Previous Screen
```

Do not force users back to Home after purchasing.

---

# Logout Flow

```text
Profile

↓

Settings

↓

Logout

↓

Confirmation Dialog

↓

Welcome Screen
```

---

# Navigation Rules

- Splash is shown only on app launch.
- Welcome is shown only once.
- Onboarding cannot be skipped.
- Scan Guidelines appear only before the first scan (unless re-enabled).
- Bottom Navigation is visible only after authentication.
- Camera opens from the center Scan tab or "Scan Today" CTA.
- Back navigation should always return to the previous screen.
- Preserve navigation state where appropriate.

---

# Animation & Transition Guidelines

- Use native iOS/Android navigation transitions.
- Fade for loading states.
- Slide for screen transitions.
- Shared element transition:
  - Analysis Complete → Results (Skin Score animation)
- Smooth progress animations.
- No abrupt screen changes.

---

# Final User Journey

```text
Splash
    ↓
Welcome
    ↓
Authentication
    ↓
Basic Information
    ↓
Skin Profile & Goals
    ↓
Home Dashboard
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Scan Today       Progress
        │              │
        ▼              │
 Guidelines         Timeline
        ▼              │
 Camera              │
        ▼              │
 AI Analysis         │
        ▼              │
 Analysis Complete   │
        ▼              │
 Results──────────────┘
        │
        ├── AI Coach
        ├── Routine
        ├── Home
        └── Profile
                 │
                 ▼
             Settings
```

---

# UX Principle

Every session should answer three simple questions:

1. How is my skin today?
2. Am I improving?
3. What should I do next?

If users can answer these within 30 seconds of opening the app, the navigation has achieved its purpose.