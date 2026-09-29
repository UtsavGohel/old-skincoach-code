# Serverless Architecture

# SkinCoach

Version: 1.0

Status: Canonical for all backend infrastructure decisions. Where an earlier doc
(`05`, `08`, `13`, `PROJECT_CONTEXT.md`, `19`) describes a container/EC2 deployment,
BullMQ + Redis queue, or Supabase Postgres, **this document supersedes it.**

---

# Why Serverless

SkinCoach is built by a solo founder. The backend priorities are, in order: lowest
idle cost, no server management, automatic scaling, production-readiness, and staying in
the TypeScript/NestJS stack we already know. AWS Lambda behind API Gateway satisfies all
of these — there is no always-on instance to pay for or patch, traffic scales to zero
when idle and up automatically under load, and NestJS runs on Lambda essentially
unchanged via an HTTP adapter.

The trade-offs we accept: cold starts on infrequently-hit functions (mitigated below),
a 15-minute Lambda execution ceiling (fine — long AI work runs async on a worker), and
the need for connection pooling in front of Postgres (Neon's pooled endpoint solves
this).

---

# High-Level Architecture

```
React Native (Expo)
        ↓  HTTPS / JSON
API Gateway (HTTP API)
        ↓
NestJS on AWS Lambda   ──►  Neon PostgreSQL (Prisma)
        │                └►  Cloudflare R2 (images)
        │
        └►  SQS (scan jobs)  ──►  Worker Lambda  ──►  Gemini 2.5 Flash Vision
                                        │
                                        └►  save analysis → push notification
```

The synchronous HTTP API never calls Gemini directly. It creates a scan record and
enqueues a job; a separate worker Lambda does the slow vision + insight work and
notifies the device when the result is ready. The user never waits 10–15 seconds on an
open request.

---

# Async AI Pipeline

```
Client captures selfie
        ↓
Request signed upload URL   (API Lambda)
        ↓
Client uploads image → Cloudflare R2
        ↓
POST /scans  → create scan record (status: processing) + enqueue SQS message  (API Lambda)
        ↓
SQS
        ↓
Vision Worker Lambda:
    • fetch image from R2
    • Gemini Vision analysis  (docs/07 Prompt 1)
    • validate JSON schema    (docs/16, one retry on malformed output)
    • historical comparison   (docs/06 Step 7)
    • insight generation      (docs/07)
    • persist analysis + insight (status: completed)
        ↓
Push notification → device  ("Your results are ready")
```

Retry and dead-letter behaviour is handled by SQS: a failed worker invocation is retried
per the queue's `maxReceiveCount`, then parked in a dead-letter queue (DLQ) for
inspection — this replaces BullMQ's in-process retry logic.

---

# Scheduled Work (Crons)

BullMQ repeatable jobs are replaced by **EventBridge Scheduler** rules that invoke
Lambda on a schedule:

```
EventBridge (cron) → Lambda → work → store → (optional) push notification
```

- **Weekly reports**: generated on a schedule, stored, then the user is notified —
  never generated inline on a request.
- **Reminder notifications**: daily-scan / morning-routine / night-routine reminders
  (docs/11), fired on schedule and filtered by each user's preferences.
- **Cleanup / maintenance**: any periodic housekeeping (expired temp files, etc.).

---

# AWS Services

| Service              | Purpose                                                     |
| -------------------- | ---------------------------------------------------------- |
| API Gateway (HTTP)   | Public HTTPS entry point for the NestJS API                |
| Lambda               | NestJS HTTP API + SQS workers + EventBridge cron functions |
| SQS (+ DLQ)          | Async AI scan-processing queue                             |
| EventBridge Scheduler| Cron jobs (weekly reports, reminders, cleanup)             |
| Secrets Manager      | API keys / secrets (Gemini, Clerk, R2, Neon URL)           |
| CloudWatch           | Logs + metrics + alarms                                    |
| IAM                  | Least-privilege permissions per function                   |

External (non-AWS): **Neon** (Postgres), **Cloudflare R2** (image storage), **Clerk**
(auth), **Gemini 2.5 Flash** (AI), **Expo Push / FCM** (notifications), **RevenueCat**
(subscriptions), **Sentry** (error tracking).

---

# Database — Neon PostgreSQL

Neon replaces Supabase as the Postgres provider. It is serverless (scales to zero,
generous free tier) and works well with Prisma.

**Connection pooling is mandatory on Lambda.** Each concurrent Lambda invocation would
otherwise open its own Postgres connection and exhaust the limit under load. Use Neon's
**pooled connection string** (PgBouncer, transaction mode) as Prisma's `DATABASE_URL` at
runtime, and Neon's **direct** connection string as `DIRECT_URL` for
`prisma migrate` (migrations can't run through the transaction pooler). This mirrors the
pooled/direct split previously used for Supabase — only the provider changes.

```
DATABASE_URL = <neon pooled endpoint>   # runtime (PgBouncer)
DIRECT_URL   = <neon direct endpoint>   # prisma migrate only
```

The Prisma schema itself (docs/04 + the refinements in docs/19) is unchanged.

---

# NestJS on Lambda

We keep the full NestJS application — modules, DI, guards, interceptors, DTOs — and add
thin Lambda entry points around it. Three kinds of entry point:

1. **HTTP API handler** — wraps the Nest app with an Express/Fastify → Lambda adapter
   (`@codegenie/serverless-express`, formerly `aws-serverless-express`) so API Gateway
   requests flow into the normal Nest router. One Lambda serves the whole API.
2. **SQS worker handlers** — bootstrap Nest in **standalone application context**
   (`NestFactory.createApplicationContext`) so workers reuse the same services/providers
   (e.g. `AnalysisService`, `R2Service`) without an HTTP server.
3. **EventBridge cron handlers** — same standalone-context pattern, triggered on a
   schedule.

**Cold starts:** the Nest DI container bootstraps on a cold start. Mitigations: bundle
with esbuild (small artifact), lazy-load heavy SDKs, keep the app module lean, and — if
p99 latency on user-facing routes demands it — enable **provisioned concurrency** on the
HTTP API Lambda only. Workers and crons are latency-insensitive, so they need none.

Bootstrapped Nest app + Prisma client are cached in the Lambda module scope so warm
invocations skip re-initialisation.

---

# Authentication — Clerk (unchanged)

Auth stays with **Clerk** — the mobile app is already built against it and the serverless
backend does not change that decision. The earlier "JWT + refresh token in Postgres"
model in `05`/`PROJECT_CONTEXT.md` is **not** used.

- Clerk owns credentials, sessions, and OAuth (Google/Apple).
- The API Lambda verifies Clerk-issued JWTs statelessly in a `ClerkAuthGuard` — no
  session store, no refresh-token rotation to build. Stateless verification is a natural
  fit for Lambda.
- A `POST /api/v1/webhooks/clerk` handler (Svix-signature verified) syncs
  `user.created/updated/deleted` into a thin `users` mirror table.

---

# Repository & Folder Structure

We keep the **two-repo** decision — `skincoach-mobile/` and `skincoach-api/` — rather
than a monorepo. Inside `skincoach-api`, the serverless entry points and infra sit
alongside the existing Nest structure:

```
skincoach-api/
  src/
    main.ts                 # local dev bootstrap (nest start)
    app.module.ts
    modules/                # business logic — unchanged (auth, scan, analysis, …)
    common/  config/  database/  storage/  prompts/
    guards/  interceptors/  filters/

    handlers/               # Lambda entry points
      api.handler.ts        #   → serverless-express wrapping the Nest app
      clerk-webhook.handler.ts

    workers/                # SQS-triggered Lambdas (standalone Nest context)
      vision.worker.ts
      weekly-report.worker.ts
      notification.worker.ts

  infra/                    # SST v3 infrastructure-as-code (see below)
  prisma/
```

`modules/` remains the home for all business logic; `handlers/` and `workers/` are only
adapters that translate a Lambda event into a call on a Nest service. This keeps the
serverless plumbing separate from domain code.

---

# Infrastructure as Code — SST v3

All AWS resources (API Gateway, Lambda functions, SQS + DLQ, EventBridge schedules,
Secrets, IAM) are defined in **SST v3** (TypeScript-native IaC, built on Pulumi/
Terraform) under `skincoach-api/infra/`.

Why SST: one TypeScript config for the whole stack, first-class local development
(`sst dev` with live Lambda), and the least YAML of the serverless IaC options — the best
fit for a solo TypeScript/NestJS developer.

- `sst dev` — local development against real (or sandboxed) AWS resources.
- `sst deploy --stage production` — deploy the stack.
- Secrets are managed via SST's `Secret` construct, backed by AWS Secrets Manager — no
  secrets in the repo or in plain `.env` for production.

---

# Environment & Secrets

- Local: `.env` (git-ignored) for dev values.
- Deployed: **AWS Secrets Manager** via SST `Secret`s. Required secrets:
  `DATABASE_URL`, `DIRECT_URL` (Neon), `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`,
  `GEMINI_API_KEY`, `CLOUDFLARE_R2_*`.
- No secret is ever logged (docs/12).

---

# Observability

- **CloudWatch** — structured logs, metrics, and alarms for every Lambda; per docs/06,
  log processing-time / model-version / confidence / retry-count for scan jobs (never
  PII, JWTs, or image bytes — docs/12).
- **Sentry** — error/crash reporting on both API and worker Lambdas.
- **DLQ alarms** — a CloudWatch alarm on the SQS dead-letter queue depth surfaces stuck
  scan jobs.

---

# Indicative MVP Cost

At early-MVP traffic, excluding Gemini token costs:

| Item              | Est. / month |
| ----------------- | ------------ |
| API Gateway       | $0–3         |
| Lambda            | $0–5         |
| SQS               | free–few $   |
| EventBridge       | ~free        |
| CloudWatch        | $1–2         |
| Neon              | free tier    |
| Cloudflare R2     | $1–5         |
| **Total**         | **~$5–15**   |

Scales with usage rather than sitting as a fixed monthly floor.

---

# What Changed vs. Earlier Docs

| Concern        | Was (earlier docs)                     | Now (this doc)                          |
| -------------- | -------------------------------------- | --------------------------------------- |
| Compute        | Container / long-running Node server   | AWS Lambda + API Gateway                |
| Queue          | BullMQ + Upstash/Redis                 | Amazon SQS (+ DLQ)                      |
| Background jobs | BullMQ workers                        | SQS worker Lambdas                      |
| Cron jobs      | BullMQ repeatable jobs                 | EventBridge Scheduler → Lambda          |
| Database       | Supabase Postgres                      | Neon Postgres (pooled endpoint)         |
| Deploy / IaC   | (unspecified) container deploy         | SST v3                                  |
| Secrets        | `.env`                                 | AWS Secrets Manager (via SST)           |
| Auth           | (docs/05 legacy) in-house JWT          | **Clerk** (already the decision; kept)  |
| Storage        | Cloudflare R2                          | Cloudflare R2 (unchanged)               |

Auth, storage, the Prisma schema, the API endpoint contracts (docs/05 paths/shapes), the
AI pipeline logic (docs/06/07/16), and the two-repo layout are all unchanged — only the
runtime, queue, cron mechanism, database provider, and deploy tooling move to serverless.
