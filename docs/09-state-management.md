# State Management

# SkinCoach

Version: 1.0

Framework

React Native (Expo)

Global State

Zustand

Server State

TanStack Query (React Query)

Persistence

MMKV Storage

Forms

React Hook Form + Zod

---

# Overview

SkinCoach separates application state into four categories:

1. Global State
2. Server State
3. Local UI State
4. Persistent Storage

Each has a clear responsibility.

Never mix them.

---

# State Architecture

```
UI

↓

Local State

↓

Zustand Store

↓

React Query

↓

API

↓

Backend
```

---

# State Responsibilities

## Local UI State

Use React useState.

Examples

- Modal Open
- Bottom Sheet
- Selected Tab
- Loading Animation
- Camera Flash
- Selected Date

Never store UI state globally.

---

## Global State

Use Zustand.

Examples

- Logged In User
- Authentication
- Theme
- Subscription
- Current Scan
- Notification Settings

---

## Server State

Use React Query.

Examples

- Dashboard
- Progress
- Results
- AI Coach
- Routine
- Profile

Never duplicate server state inside Zustand.

---

## Persistent State

Use MMKV.

Persist only:

- Access Token
- Refresh Token
- Theme
- Language
- Onboarding Completed
- User Preferences

Never persist API responses.

---

# Zustand Stores

```
store/

auth.store.ts

user.store.ts

scan.store.ts

subscription.store.ts

settings.store.ts

notification.store.ts
```

---

# Auth Store

Stores

```
isLoggedIn

accessToken

refreshToken

userId

isLoading
```

Actions

```
login()

logout()

refreshToken()

updateToken()
```

---

# User Store

Stores

```
profile

skinType

goal

membership

avatar
```

Actions

```
updateProfile()

clearProfile()
```

---

# Scan Store

Stores

```
currentScan

capturedImage

scanStatus

currentScore

analysisProgress
```

Actions

```
setCapturedImage()

startScan()

finishScan()

clearScan()
```

Temporary only.

---

# Subscription Store

Stores

```
plan

expiry

isPremium

remainingScans
```

Actions

```
upgrade()

refresh()

consumeScan()
```

---

# Settings Store

Stores

```
theme

language

notifications

dailyReminder

timezone
```

Actions

```
updateSettings()

reset()
```

---

# Notification Store

Stores

```
permission

deviceToken

enabled
```

---

# React Query Structure

```
queries/

dashboard.query.ts

profile.query.ts

progress.query.ts

scan.query.ts

routine.query.ts

coach.query.ts

subscription.query.ts
```

---

# Query Keys

```
["dashboard"]

["profile"]

["scan", scanId]

["progress"]

["routine"]

["coach"]

["subscription"]
```

Always use consistent query keys.

---

# Cache Strategy

Dashboard

1 minute

Profile

10 minutes

Progress

5 minutes

Routine

2 minutes

AI Coach

5 minutes

Subscription

30 minutes

---

# Cache Invalidation

After Scan

Invalidate

```
dashboard

progress

coach
```

After Routine Completion

Invalidate

```
routine

dashboard

progress
```

After Profile Update

Invalidate

```
profile

dashboard
```

---

# Mutation Strategy

Use optimistic updates where appropriate.

Examples

Routine Completion

Profile Update

Notification Toggle

Avoid optimistic updates for

AI Scan

Subscription

Authentication

---

# Loading States

Every query supports

```
Loading

Refreshing

Error

Success
```

Never show blank screens.

Always use Skeleton UI.

---

# Error Handling

Each query returns

```
Loading

Success

Error

Empty
```

Create reusable Error components.

---

# Offline Strategy

If offline

Allow

- View Progress
- View Results
- View Routine
- View Profile

Disable

- New Scan
- AI Chat
- Subscription Purchase

Show Offline Banner.

---

# Background Refresh

Refresh automatically

Dashboard

App Open

Pull To Refresh

App Resume

Do not refresh every navigation.

---

# Polling

Only Scan Status uses polling.

Every

2 seconds

Stop immediately after completion.

---

# State Ownership

```
Dashboard

↓

React Query

Routine

↓

React Query

Profile

↓

React Query

Authentication

↓

Zustand

Camera

↓

Local State

Animations

↓

Local State
```

---

# Form Management

Use

React Hook Form

Validation

Zod

Forms

Login

Signup

Profile

Routine

Settings

Never use useState for forms.

---

# Navigation State

Managed by

React Navigation

Never duplicate navigation state.

---

# Image State

Capture

↓

Local State

↓

Upload

↓

Clear Memory

Never keep full-resolution images in memory longer than necessary.

---

# AI Scan Flow

```
Capture Image

↓

Local State

↓

Upload

↓

Polling

↓

Result

↓

React Query Cache

↓

Dashboard Updates
```

---

# Memory Management

After successful scan

Clear

Captured Image

Temporary Buffers

Upload Cache

Prevent memory leaks.

---

# Persistence

Persist

```
Auth

Settings

Theme

Language

Subscription
```

Do NOT Persist

```
Dashboard

Progress

Results

AI Chat

Routine

Current Scan
```

Always fetch fresh server data.

---

# Security

Never store

Passwords

AI Results

JWT in AsyncStorage

Use MMKV Secure Storage.

---

# Testing

Mock Zustand Stores

Mock React Query

Mock API

Test each independently.

---

# Best Practices

- Single source of truth.
- Never duplicate state.
- Use React Query for server data.
- Keep Zustand lightweight.
- Keep UI state local.
- Invalidate caches properly.
- Prefer composition over large stores.
- Clear temporary state after use.

---

# Final Architecture

```
React Native

↓

Local UI State

↓

Zustand

↓

React Query

↓

API Layer

↓

NestJS

↓

PostgreSQL

↓

Cloudflare R2

↓

Gemini AI
```

This separation keeps the app fast, maintainable, and scalable while avoiding unnecessary re-renders and complex state synchronization.