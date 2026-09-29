# Coding Guidelines

# SkinCoach

Version: 1.0

---

# Purpose

This document defines the coding standards for the entire SkinCoach project.

Every developer and AI coding assistant must follow these rules.

The goal is to produce clean, scalable, maintainable, and production-ready code.

---

# General Principles

- Keep functions small and focused.
- Prefer readability over cleverness.
- Avoid duplication (DRY).
- Follow SOLID principles.
- Fail fast with clear errors.
- Write self-documenting code.

---

# Language

TypeScript only.

Enable

- strict
- noImplicitAny
- strictNullChecks

Never use `any`.

Prefer explicit types.

---

# Naming Conventions

Variables

camelCase

Functions

camelCase

Components

PascalCase

Hooks

useSomething

Interfaces

IUser (or simply User if preferred consistently)

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

Files

feature-name.ts

---

# Folder Rules

One responsibility per folder.

Example

Home/

- HomeScreen.tsx
- Home.styles.ts
- Home.types.ts
- Home.hooks.ts
- index.ts

---

# Components

One component per file.

Maximum

250 lines.

Extract reusable logic into hooks.

---

# Functions

Maximum

40 lines.

Maximum parameters

4

Avoid nested if statements.

Prefer early returns.

---

# Error Handling

Never swallow errors.

Always

- Log
- Handle
- Return meaningful messages

Use custom exceptions.

---

# Async Code

Use async/await.

Avoid Promise chains.

Always wrap API calls in try/catch.

---

# Comments

Comment WHY.

Do not comment WHAT.

Bad

// increment i

Good

// Retry because Gemini occasionally returns malformed JSON

---

# API Layer

Never call fetch directly.

Use

api/

services/

---

# Validation

Backend

class-validator

Frontend

Zod

Never trust client input.

---

# Environment Variables

Never hardcode

API Keys

URLs

Secrets

Tokens

Use .env files.

---

# Logging

Use structured logging.

Never log

Passwords

JWT

Images

Payment Data

---

# Git Rules

Branch

feature/scan-upload

Commit

feat: add Gemini analysis pipeline

Use Conventional Commits.

---

# Pull Request Checklist

- Builds successfully
- No TypeScript errors
- No ESLint warnings
- Tests pass
- Documentation updated

---

# Final Principle

Code should be understandable by another developer after six months without explanation.