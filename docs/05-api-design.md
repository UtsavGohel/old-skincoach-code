# API Design

# SkinCoach

Version: 1.0

Architecture

Mobile App
        ↓  HTTPS / JSON
API Gateway (HTTP API)
        ↓
NestJS on AWS Lambda
        ├──►  Neon PostgreSQL (Prisma)
        ├──►  Cloudflare R2
        └──►  SQS → Vision Worker Lambda → Gemini 2.5 Flash Vision

> Runtime & deployment are **serverless** — see `20-serverless-architecture.md`
> (canonical). The endpoint paths, request/response shapes, and versioning below are
> unchanged by that move; only the transport (API Gateway → Lambda) and the async
> mechanism (SQS/EventBridge instead of BullMQ) differ.

---

# API Standards

Protocol

HTTPS

Format

JSON

Authentication

**Clerk** — the API verifies Clerk-issued JWTs statelessly in a guard (Clerk owns
credentials, sessions, and Google/Apple OAuth). The in-house "JWT access + refresh
token" model below is **superseded**; it is retained only as historical context. See
docs/19 and `20-serverless-architecture.md`.

Versioning

/api/v1/

Content Type

application/json

---

# Authentication APIs

> **Superseded by Clerk.** These register/login/refresh endpoints reflect the original
> in-house JWT design and are kept for historical context only. In the shipped
> architecture, Clerk handles registration, login, OAuth, and sessions; the backend
> exposes `POST /api/v1/webhooks/clerk` (Svix-verified) to sync a thin `users` mirror
> and `GET/PATCH /api/v1/users/me` for the profile. See docs/19 and
> `20-serverless-architecture.md`.

## Register

POST

/api/v1/auth/register

Request

{
    "name": "Utsav",
    "email": "user@email.com",
    "password": "********"
}

Response

{
    "user": {},
    "accessToken": "...",
    "refreshToken": "..."
}

---

## Login

POST

/api/v1/auth/login

---

## Google Login

POST

/api/v1/auth/google

---

## Apple Login

POST

/api/v1/auth/apple

---

## Refresh Token

POST

/api/v1/auth/refresh

---

## Logout

POST

/api/v1/auth/logout

---

# User APIs

## Get Profile

GET

/api/v1/users/me

---

## Update Profile

PATCH

/api/v1/users/me

Request

{
    "skinType":"Combination",
    "goal":"Acne Reduction"
}

---

## Upload Profile Picture

POST

/api/v1/users/profile-image

multipart/form-data

---

# Home Dashboard

## Dashboard

GET

/api/v1/dashboard

Returns

{
    "todayScore":84,
    "streak":18,
    "todayRoutine":{},
    "latestInsight":{},
    "scanAvailable":true
}

---

# Scan APIs

## Generate Upload URL

POST

/api/v1/scans/upload-url

Purpose

Generate secure Cloudflare R2 upload URL.

Response

{
   "uploadUrl":"",
   "imageKey":""
}

---

## Start Scan

POST

/api/v1/scans

Request

{
   "imageKey":"",
   "device":"iPhone 15"
}

Returns

{
   "scanId":"..."
}

Status

Processing

---

## Get Scan Status

GET

/api/v1/scans/{scanId}/status

Response

{
   "status":"processing"
}

Possible values

processing

completed

failed

---

## Get Scan Result

GET

/api/v1/scans/{scanId}

Returns

{
    "score":84,
    "analysis":{},
    "insights":{}
}

---

## Scan History

GET

/api/v1/scans

Query

?page=1&limit=20

---

## Delete Scan

DELETE

/api/v1/scans/{scanId}

---

# Progress APIs

## Progress Summary

GET

/api/v1/progress

Returns

Weekly

Monthly

Overall

---

## Progress Timeline

GET

/api/v1/progress/timeline

---

## Progress Chart

GET

/api/v1/progress/chart

Query

?range=30d

Options

7d

30d

90d

1y

---

# Routine APIs

## Get Routine

GET

/api/v1/routines

---

## Create Routine

POST

/api/v1/routines

---

## Update Routine

PATCH

/api/v1/routines/{id}

---

## Delete Routine

DELETE

/api/v1/routines/{id}

---

## Complete Routine Item

POST

/api/v1/routines/items/{id}/complete

---

## Weekly Routine Stats

GET

/api/v1/routines/stats

---

# AI Coach

## Today's Insights

GET

/api/v1/coach/today

---

## Ask AI

POST

/api/v1/coach/chat

Request

{
    "message":"Why am I getting acne?"
}

Response

{
    "reply":"..."
}

---

## Chat History

GET

/api/v1/coach/history

---

# Achievements

GET

/api/v1/achievements

---

# Notifications

GET

/api/v1/notifications

PATCH

/api/v1/notifications/{id}/read

---

# Settings

GET

/api/v1/settings

PATCH

/api/v1/settings

---

# Subscription

## Plans

GET

/api/v1/subscriptions/plans

---

## Current Subscription

GET

/api/v1/subscriptions/me

---

## Purchase Validation

POST

/api/v1/subscriptions/verify

---

# Analytics

POST

/api/v1/analytics/events

Example

scan_completed

routine_completed

subscription_started

---

# File Upload Flow

1.

Generate Upload URL

↓

2.

Upload directly to Cloudflare R2

↓

3.

Receive imageKey

↓

4.

Call Start Scan API

↓

5.

Backend downloads image

↓

6.

Gemini Vision Analysis

↓

7.

Save Results

↓

8.

Return Results

---

# HTTP Status Codes

200

Success

201

Created

400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Business Validation

429

Too Many Requests

500

Server Error

---

# Error Format

{
    "success":false,
    "message":"Face not detected.",
    "code":"FACE_NOT_FOUND"
}

---

# Pagination

{
   "page":1,
   "limit":20,
   "total":152,
   "hasNext":true,
   "items":[]
}

---

# Authentication

Every protected endpoint requires

Authorization

Bearer <JWT>

---

# Rate Limits

Authentication

10/minute

AI Chat

30/day (Free)

Unlimited (Pro)

Scan Upload

5/month (Free)

Unlimited (Pro)

---

# API Security

JWT Authentication

HTTPS Only

Input Validation

Request Sanitization

Rate Limiting

File Type Validation

Image Size Validation

Signed Upload URLs

Server-side Authorization

---

# Future APIs

Habit Tracking

Sleep Tracking

Water Intake

Weather Correlation

Product Effectiveness

Dermatologist Booking

Community

Family Accounts

Apple Health Integration

Wearables

---

# REST Naming Convention

GET

Fetch data

POST

Create

PATCH

Partial update

DELETE

Remove

Never use verbs in URLs.

Good

/users/me

Bad

/getUser

---

# Development Principles

• Keep APIs resource-oriented.

• Keep responses consistent.

• Never expose internal database IDs unnecessarily.

• Return structured AI responses.

• Support future mobile/web clients without API changes.

• Design endpoints to remain stable across versions.