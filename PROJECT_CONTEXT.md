# PROJECT_CONTEXT.md

# SkinCoach

Version: 1.0

Last Updated: July 2026

---

# Project Vision

SkinCoach is an AI-powered mobile application that helps users improve their skin through long-term tracking instead of one-time analysis.

Unlike traditional AI skin scanners, SkinCoach focuses on daily progress, personalized coaching, and habit building.

Users should feel like they have a personal skin coach—not just an AI scanner.

The application should answer four questions every day:

1. How does my skin look today?
2. Is it improving?
3. Why did it change?
4. What should I do next?

Everything built in this project should support that vision.

---

# MVP Goal

The MVP is intentionally small.

The primary user journey is:

Open App

↓

Take Selfie

↓

AI Analysis

↓

View Results

↓

Track Progress

↓

Complete Routine

↓

Return Tomorrow

If a feature does not improve this journey, it is not part of MVP.

---

# Target Users

Age

18–40

Primary Users

• Acne

• Oily Skin

• Dry Skin

• Pigmentation

• Skin Care Enthusiasts

Not intended for medical diagnosis.

---

# Core Features

Authentication

User Profile

Daily Skin Scan

Gemini Vision Analysis

Results Screen

Progress Timeline

Routine Tracker

AI Coach

Notifications

Subscription

Settings

Everything else is future scope.

---

# Technology Stack

## Mobile

React Native

Expo

TypeScript

React Navigation

Zustand

TanStack Query

React Hook Form

Zod

Reanimated

Expo Camera

Expo Notifications

MMKV Storage

RevenueCat

---

## Backend

NestJS (serverless — AWS Lambda + API Gateway)

TypeScript

Prisma ORM

Neon PostgreSQL (serverless)

Amazon SQS (async AI processing)

EventBridge Scheduler (cron jobs)

Cloudflare R2

Clerk Authentication

> Backend infrastructure is serverless — see `docs/20-serverless-architecture.md`
> (canonical). This supersedes the earlier BullMQ + Redis queue, Supabase/Postgres
> host, and in-house JWT auth referenced elsewhere in this file.

---

## AI

Gemini 2.5 Flash Vision

Gemini 2.5 Flash

Structured JSON Output

---

## Infrastructure

AWS Lambda + API Gateway (serverless compute)

Amazon SQS + DLQ (async queue)

EventBridge Scheduler (cron)

AWS Secrets Manager (secrets)

CloudWatch (logs/metrics)

SST v3 (infrastructure-as-code)

Cloudflare R2

Firebase Analytics

Mixpanel

Sentry

GitHub Actions

---

# Architecture

The application follows Feature-Based Clean Architecture.

```
Screen

↓

Hook

↓

Service

↓

API Layer

↓

NestJS

↓

Gemini

↓

Database
```

Business logic never belongs inside screens.

---

# Project Structure

```
apps/

mobile/

api/

packages/

ui/

types/

utils/

validators/

prompts/

docs/
```

Never create new folders unless absolutely necessary.

---

# Mobile Navigation

Splash

↓

Welcome

↓

Authentication

↓

Basic Information

↓

Skin Goals

↓

Home

↓

Camera

↓

Analyzing

↓

Results

↓

Progress

↓

Routine

↓

AI Coach

↓

Profile

↓

Settings

Follow the documented navigation exactly.

---

# Design Philosophy

The application should feel

Premium

Luxury

Minimal

Calm

Organic

Modern

Never feel

Corporate

Material Design

Medical

Enterprise

Gaming

---

# Design Language

Theme

Warm Cream

Sage Green

Soft Mint

White

Typography

Large

Spacious

Minimal

Cards

Rounded

Soft Shadows

No Heavy Borders

Animations

Subtle

Smooth

200–300ms

---

# UI Rules

Reuse components.

Never redesign components inside screens.

Never hardcode colors.

Never hardcode spacing.

Use theme values only.

Every screen supports

Loading

Empty

Error

Success

Dark Mode

Accessibility

---

# Coding Standards

TypeScript Strict Mode

No any

Small functions

Reusable components

SOLID principles

Early returns

Meaningful variable names

No duplicated logic

Maximum Component

250 lines

Maximum File

400 lines

Maximum Function

40 lines

---

# State Management

Local UI

↓

React State

Global

↓

Zustand

Server

↓

React Query

Persistence

↓

MMKV

Never duplicate state.

---

# API Rules

Never call fetch() directly.

Use

/api

Use typed DTOs.

Always validate responses.

Always handle errors.

---

# Database

PostgreSQL

Prisma ORM

UUID Primary Keys

Images stored only in Cloudflare R2.

Database stores only metadata.

Never store image binary.

---

# AI Pipeline

Image

↓

Validation

↓

Gemini Vision

↓

Structured JSON

↓

Backend Validation

↓

Historical Comparison

↓

Insight Generation

↓

Store Results

↓

Return Response

Gemini never generates final user-facing text directly from the image.

The backend compares history.

Gemini generates coaching.

---

# AI Principles

Never diagnose.

Never prescribe medication.

Never exaggerate.

Always encourage.

Always compare historical scans.

Always explain improvements simply.

---

# Security

JWT Authentication

HTTPS Only

Signed Upload URLs

Encrypted Storage

No Public Images

Rate Limiting

Secure Logging

Privacy First

---

# Subscription

Freemium

Free

1 AI Scan per Day

Basic AI Coach

Routine

Timeline

Pro

Unlimited Scans

Advanced AI

Weekly Reports

Priority Processing

Future Premium Features

Never build a credit system.

---

# Notifications

Daily Scan Reminder

Morning Routine

Night Routine

Weekly Summary

Achievements

Respect user preferences.

No spam.

---

# Performance Goals

App Launch

<2 Seconds

Dashboard

<1 Second

AI Analysis

<10 Seconds

Navigation

<200ms

Crash-Free Sessions

99.8%

---

# Code Generation Rules

Before writing code

Claude must

Understand requirement

Search existing implementation

Reuse existing code

Avoid duplication

Keep architecture clean

Never guess implementation details.

If requirements are unclear,

ask for clarification.

---

# Refactoring Rules

Immediately refactor if

Component >250 lines

File >400 lines

Function >40 lines

Repeated logic

Repeated styles

Business logic inside UI

---

# Git

Conventional Commits

feat:

fix:

refactor:

docs:

test:

style:

build:

Feature branches only.

Never commit directly to main.

---

# Testing

Every feature must include

Loading State

Error State

Empty State

Success State

Validation

Unit Test (where applicable)

Integration Test (critical flows)

---

# Documentation

Whenever architecture changes,

update

API Docs

Database Docs

Prompt Docs

Architecture Docs

Never let documentation become outdated.

---

# Current MVP Status

Product Planning

✅ Complete

Design System

✅ Complete

UI Flow

✅ Complete

Database Design

✅ Complete

API Design

✅ Complete

AI Architecture

✅ Complete

Prompt Architecture

✅ Complete

Folder Structure

✅ Complete

State Management

✅ Complete

Subscription Design

✅ Complete

Notification Design

✅ Complete

Security Design

✅ Complete

Development Roadmap

✅ Complete

Development

⏳ Not Started

---

# Future Scope

Habit Correlation

Water Tracking

Sleep Tracking

Weather Analysis

Product Effectiveness

Apple Health

Google Fit

Dermatologist Marketplace

Community

Family Accounts

Custom Vision Model

---

# Decision Priority

Whenever multiple implementations are possible, choose in this order:

1. Correctness

2. Security

3. Maintainability

4. Scalability

5. Readability

6. Performance

7. Developer Convenience

---

# Final Instructions for Claude Code

You are the Senior Staff Engineer responsible for building SkinCoach.

Do not rush implementation.

Always think about long-term maintainability.

Reuse components whenever possible.

Follow the architecture strictly.

Keep the code clean, typed, modular, and production-ready.

When implementing any feature:

1. Understand the requirement.
2. Review existing code.
3. Reuse before creating.
4. Keep UI separate from business logic.
5. Validate all inputs and AI outputs.
6. Write code that another engineer can understand immediately.
7. Leave the project in a better state than you found it.

Every commit should move the project closer to a polished, App Store-ready product.

Build for years of maintainability, not just today's feature.