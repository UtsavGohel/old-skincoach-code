# Claude Development Rules

# SkinCoach

Version: 1.0

Purpose

This document contains mandatory engineering rules that Claude Code must follow while developing SkinCoach.

These rules override default coding behavior whenever there is a conflict.

The goal is to ensure the project remains scalable, maintainable, and production-ready from day one.

---

# Core Principles

Always optimize for

• Readability

• Scalability

• Reusability

• Performance

• Security

Never optimize for writing fewer lines of code.

Good architecture is more important than shorter code.

---

# Think Before Coding

Before writing any code,

Claude must

1. Understand the requirement.

2. Identify reusable components.

3. Check existing implementation.

4. Avoid duplicate logic.

5. Decide the cleanest architecture.

Never immediately start coding.

---

# Follow Existing Architecture

Claude must follow the project structure exactly.

Never invent new folders.

Never move files.

Never create a second implementation for an existing feature.

---

# Never Duplicate Code

If similar logic already exists,

Reuse it.

Extract common functionality into

Hooks

Services

Utilities

Shared Components

Never copy-paste.

---

# Reusable Components

Before creating a component,

Check

/components

If similar exists,

Extend it.

Never create

Button2

PrimaryButton

MainButton

Use

Button

with variants.

---

# Feature Isolation

Every feature owns

API

Hooks

Business Logic

Types

Constants

Validation

Never place feature logic inside screens.

---

# Screen Responsibilities

Screens should

Render UI

Handle navigation

Call hooks

Nothing else.

Screens must NOT

Call APIs directly

Contain business logic

Perform validation

Contain AI logic

---

# Business Logic

Business logic belongs only inside

/services

or

/features

Never inside components.

---

# API Rules

All API calls go through

/api

Never use

fetch()

axios()

inside screens.

---

# State Rules

React State

↓

Local UI

Zustand

↓

Global App State

React Query

↓

Server State

Never duplicate server state inside Zustand.

---

# Component Size

Maximum

250 lines.

If larger,

Split into

Header

Body

Card

Modal

Hooks

---

# Function Size

Maximum

40 lines.

If larger,

Extract helpers.

---

# File Size

Maximum

400 lines.

If exceeded,

Refactor.

---

# Hook Rules

One responsibility per hook.

Good

useScan()

useUpload()

useCamera()

Bad

useEverything()

---

# Service Rules

Services should

Contain business logic.

Return typed data.

Throw meaningful errors.

Never return

any

---

# TypeScript Rules

Never use

any

Never disable strict mode.

Prefer

type

for objects.

Use

enum

only where appropriate.

Always infer when possible.

---

# Props Rules

Always define Props types.

Example

type ButtonProps = {}

Never use inline prop types.

---

# Styling Rules

Never hardcode

Spacing

Colors

Typography

Radius

Use

theme/

Only.

---

# Animation Rules

Use

React Native Reanimated

Keep animations

Subtle

Fast

Smooth

Never animate unnecessarily.

---

# Forms

Always use

React Hook Form

+

Zod

Never use useState for forms.

---

# Validation

Validate

Frontend

Backend

Database

Never trust client data.

---

# Error Handling

Every async function must

try

↓

catch

↓

Log

↓

Throw typed error

Never swallow exceptions.

---

# Logging

Log only

Useful debugging information.

Never log

Passwords

JWT

Images

Personal Data

API Keys

---

# Security

Always sanitize

Input

Headers

Query Params

File Uploads

Never expose

Stack traces

Internal IDs

Database errors

---

# AI Rules

Gemini responses

Must be validated.

Reject malformed JSON.

Retry once.

Store prompt version.

Store model version.

Never trust AI output.

---

# Database Rules

Never use raw SQL.

Use Prisma.

Use transactions when modifying multiple tables.

Use indexes where appropriate.

---

# Performance Rules

Lazy load screens.

Memoize expensive components.

Avoid unnecessary re-renders.

Use FlatList.

Never use ScrollView for long lists.

Compress images before upload.

---

# Images

Upload

↓

Cloudflare R2

↓

Store URL

Never store image binary in PostgreSQL.

---

# Navigation

Every navigation route

Must be typed.

Never use

any

for navigation.

---

# Accessibility

Every button

Needs accessibilityLabel.

Support

Screen Readers

Dynamic Fonts

Large Text

---

# Testing

Every new feature should include

Unit Tests

Error Cases

Loading State

Empty State

Success State

---

# Before Creating Anything

Claude must ask

Does this already exist?

Can this be reused?

Can this be simplified?

Will another developer understand this?

---

# Before Every Commit

Check

✓ Build passes

✓ TypeScript passes

✓ ESLint passes

✓ Tests pass

✓ No duplicated logic

✓ Documentation updated

---

# Code Review Checklist

Ask

Is this reusable?

Is this scalable?

Is this typed?

Is this tested?

Is this readable?

Is this secure?

Can it be simplified?

---

# Refactoring Rules

Refactor immediately if

File >400 lines

Function >40 lines

Component duplicated

Business logic inside UI

Repeated API logic

Repeated validation

Repeated styles

---

# Performance Targets

App Launch

<2 seconds

Navigation

<200ms

Dashboard

<1 second

AI Analysis

<10 seconds

Image Upload

<5 seconds

---

# Git Rules

Branch

feature/scan-upload

fix/login

refactor/dashboard

Commit Style

feat:

fix:

refactor:

docs:

test:

style:

build:

Follow Conventional Commits.

---

# Documentation

Whenever a new feature is added,

Update

API Docs

Database Docs

Architecture Docs

Prompt Docs

if affected.

Documentation should never become outdated.

---

# Decision Priority

When multiple implementations are possible,

Choose in this order

1.

Correctness

↓

2.

Security

↓

3.

Readability

↓

4.

Maintainability

↓

5.

Performance

↓

6.

Developer Convenience

Never sacrifice correctness for shorter code.

---

# Final Rule

Claude is acting as a Senior Staff Engineer.

Every implementation should be something that could confidently be deployed to production and maintained for years.

If uncertain,

choose the solution that is simpler,

more maintainable,

better typed,

and easier to extend.