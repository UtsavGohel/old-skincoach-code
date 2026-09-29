# Folder Structure

# SkinCoach

Version: 1.0

---

# Overview

This document defines the complete project structure for SkinCoach.

The project consists of:

- Mobile App (React Native + Expo)
- Backend (NestJS)
- Database (PostgreSQL + Prisma)
- AI Prompts
- Documentation

The architecture follows Clean Architecture principles.

---

# Project Structure

```
skincoach/

├── apps/
│
│   ├── mobile/
│   └── api/
│
├── packages/
│
│   ├── ui/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   ├── config/
│   └── validators/
│
├── prompts/
│
├── docs/
│
├── scripts/
│
├── .github/
│
├── package.json
├── turbo.json
└── README.md
```

---

# Mobile App

```
apps/mobile

src/

├── app/
│
├── navigation/
│
├── screens/
│
├── components/
│
├── features/
│
├── hooks/
│
├── services/
│
├── store/
│
├── api/
│
├── assets/
│
├── theme/
│
├── utils/
│
├── constants/
│
├── types/
│
└── providers/
```

---

# Screen Structure

```
screens/

Splash/

Welcome/

Authentication/

BasicInfo/

SkinGoals/

Home/

ScanGuidelines/

Camera/

Analyzing/

AnalysisComplete/

Results/

Progress/

Routine/

AICoach/

Profile/

Settings/
```

Each screen contains

```
Home/

HomeScreen.tsx

Home.styles.ts

Home.types.ts

Home.hooks.ts

index.ts
```

---

# Feature Modules

```
features/

auth/

camera/

scan/

analysis/

progress/

routine/

coach/

profile/

subscription/

notifications/
```

Each feature owns

Components

Hooks

API

Business Logic

Types

---

# Components

```
components/

Button/

Card/

Input/

Avatar/

ProgressRing/

Chart/

BottomNavigation/

Timeline/

MetricCard/

RoutineItem/

AIInsightCard/

AchievementBadge/

EmptyState/

Loading/

Modal/

BottomSheet/

Toast/
```

Only reusable UI lives here.

---

# Theme

```
theme/

colors.ts

spacing.ts

typography.ts

radius.ts

shadow.ts

animation.ts

index.ts
```

---

# Services

```
services/

auth.service.ts

scan.service.ts

ai.service.ts

routine.service.ts

progress.service.ts

notification.service.ts
```

Business logic only.

No UI.

---

# API Layer

```
api/

client.ts

auth.api.ts

scan.api.ts

progress.api.ts

routine.api.ts

coach.api.ts

subscription.api.ts
```

Every API call goes here.

Never call fetch directly from screens.

---

# Hooks

```
hooks/

useAuth.ts

useScan.ts

useProgress.ts

useRoutine.ts

useAI.ts

useSubscription.ts

useNotifications.ts
```

---

# Global Store

```
store/

auth.store.ts

user.store.ts

scan.store.ts

progress.store.ts

routine.store.ts

settings.store.ts
```

Recommended

Zustand

---

# Assets

```
assets/

images/

icons/

illustrations/

animations/

fonts/
```

---

# Backend

> Deployment target is **serverless (AWS Lambda + API Gateway)** — see
> `20-serverless-architecture.md`, which is canonical. `main.ts` is the local-dev
> bootstrap; on AWS the app is entered through `handlers/` (Lambda entry points) and
> `workers/` (SQS-triggered). Business logic stays in `modules/`. Note also that the
> backend lives in its own repo (`skincoach-api/`) rather than under `apps/api` — the
> project uses two separate repos, not a monorepo (docs/19).

```
skincoach-api/

src/

main.ts              # local dev bootstrap (nest start)

app.module.ts

common/

config/

database/

modules/

handlers/            # Lambda entry points (api.handler.ts, clerk-webhook.handler.ts)

workers/             # SQS-triggered Lambdas (vision, weekly-report, notification)

storage/

prompts/

middlewares/

filters/

guards/

interceptors/

decorators/

utils/

infra/                 # SST v3 infrastructure-as-code (sibling of src/)
```

---

# Backend Modules

```
modules/

auth/

users/

scan/

analysis/

progress/

routine/

coach/

subscription/

notifications/

settings/

dashboard/
```

Every module contains

```
controller

service

repository

dto

entity

types

constants

tests
```

---

# Database

```
database/

prisma/

migrations/

seed/

schema.prisma
```

---

# Prompt Folder

```
prompts/

vision-analysis.md

historical-comparison.md

daily-insight.md

weekly-summary.md

routine.md

coach.md

notifications.md

achievements.md
```

Never hardcode prompts.

---

# Storage

```
storage/

upload.service.ts

cloudflare-r2.service.ts

image-processing.service.ts
```

---

# Workers (SQS-triggered Lambdas)

```
workers/

vision.worker.ts          # SQS: run Gemini vision analysis for a scan job

weekly-report.worker.ts   # EventBridge cron: generate weekly reports

notification.worker.ts    # EventBridge cron: send scheduled reminders
```

Each worker bootstraps NestJS in standalone application context and calls the same
`modules/` services the HTTP API uses — no logic is duplicated. See
`20-serverless-architecture.md`.

---

# Queue & Scheduling

There is no in-app queue module. AI analysis runs asynchronously on **Amazon SQS** (with
a dead-letter queue), and scheduled work runs on **EventBridge Scheduler** — both defined
in `infra/` (SST) and consumed by `workers/`. This replaces the earlier BullMQ + Redis
design.

AI analysis must run asynchronously.

Never block API requests.

---

# Infrastructure (SST v3)

```
infra/

sst.config.ts             # stack: API Gateway, Lambda, SQS + DLQ, EventBridge, Secrets, IAM
```

Infrastructure-as-code lives in the backend repo. `sst dev` for local development,
`sst deploy --stage production` to ship. Secrets are backed by AWS Secrets Manager.

---

# Shared Packages

```
packages/ui

Reusable UI

packages/types

Shared Types

packages/constants

Enums

packages/utils

Shared Helpers

packages/config

Shared Configuration

packages/validators

Zod Schemas
```

---

# Environment

```
.env

.env.local

.env.production
```

Never commit secrets.

---

# Documentation

```
docs/

01-product-requirements.md

02-app-flow.md

03-ui-components.md

04-database-schema.md

05-api-design.md

06-ai-analysis-flow.md

07-gemini-prompts.md

08-folder-structure.md

09-state-management.md

10-subscription-flow.md

11-notification-flow.md

12-security-privacy.md

13-development-roadmap.md
```

---

# Naming Convention

Folders

camel-case

Files

feature-name.ts

Components

PascalCase

Hooks

useSomething

Stores

something.store.ts

Services

something.service.ts

DTO

create-user.dto.ts

---

# Import Order

1.

React

2.

Third-party

3.

Internal Packages

4.

Components

5.

Hooks

6.

Utils

7.

Styles

---

# Architecture Rules

Screens

↓

Hooks

↓

Services

↓

API Layer

↓

Backend

↓

Database

Screens should never call APIs directly.

---

# Testing Structure

```
tests/

unit/

integration/

e2e/
```

---

# Future Expansion

```
apps/web

apps/admin

apps/landing

packages/sdk
```

Current architecture supports these without restructuring.

---

# Principles

- Feature-first architecture
- Shared UI components
- Clean separation of concerns
- Strong typing
- Modular backend
- Reusable prompts
- Scalable monorepo
- Easy onboarding for new developers