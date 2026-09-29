# Database Schema

# SkinCoach

Version: 1.0

Database

PostgreSQL

ORM

Prisma ORM

---

# Overview

The database is designed around one core concept:

A user performs daily skin scans.

Every scan generates AI analysis.

Historical scans create progress.

Progress generates insights.

Insights improve routines.

The schema is optimized for:

- Long-term tracking
- AI analysis
- Fast dashboard loading
- Subscription support
- Future scalability

---

# Entity Relationship

User
│
├── Profile
├── Subscription
├── SkinScan
│      ├── SkinAnalysis
│      ├── ScanImage
│      └── AIInsight
├── Routine
│      └── RoutineLog
├── AIConversation
├── Notification
└── Device

---

# Users

Table

users

Purpose

Authentication and account information.

Columns

id (UUID)

email

full_name

profile_image

provider

email_verified

created_at

updated_at

deleted_at

Indexes

email

provider

---

# User Profiles

Table

user_profiles

Purpose

Personal information collected during onboarding.

Columns

id

user_id

age

gender

skin_type

primary_goal

experience_level

timezone

country

created_at

updated_at

Relationship

One User

One Profile

---

# Skin Scans

Table

skin_scans

Purpose

One record for every selfie scan.

Columns

id

user_id

scan_date

image_url

thumbnail_url

status

processing_time_ms

device_model

lighting_score

face_detected

created_at

Indexes

user_id

scan_date

status

---

# Skin Analysis

Table

skin_analysis

Purpose

Stores AI-generated structured analysis.

Columns

id

scan_id

overall_score

acne_score

hydration_score

redness_score

texture_score

pigmentation_score

oiliness_score

pores_score

wrinkle_score

dark_circle_score

confidence_score

analysis_version

created_at

Relationship

One Scan

One Analysis

---

# AI Insights

Table

ai_insights

Purpose

Human-readable AI recommendations.

Columns

id

scan_id

summary

recommendation

positive_changes

attention_needed

next_steps

created_at

---

# Progress Snapshots

Table

progress_snapshots

Purpose

Stores historical progress calculations for faster dashboard loading.

Columns

id

user_id

week

month

average_score

best_score

improvement

hydration_change

acne_change

redness_change

created_at

---

# Routines

Table

routines

Purpose

User skincare routines.

Columns

id

user_id

name

time_of_day

is_active

created_at

---

# Routine Items

Table

routine_items

Columns

id

routine_id

product_name

step_order

product_type

instructions

reminder_time

is_active

---

# Routine Logs

Table

routine_logs

Purpose

Tracks completed skincare steps.

Columns

id

routine_item_id

user_id

completed

completed_at

scan_id (optional)

Indexes

user_id

completed_at

---

# AI Conversations

Table

ai_conversations

Purpose

Stores AI chat history.

Columns

id

user_id

title

created_at

updated_at

---

# AI Messages

Table

ai_messages

Columns

id

conversation_id

role

message

tokens

created_at

---

# Achievements

Table

achievements

Purpose

Defines available achievements.

Columns

id

title

description

icon

category

required_value

---

# User Achievements

Table

user_achievements

Columns

id

user_id

achievement_id

earned_at

---

# Notifications

Table

notifications

Columns

id

user_id

title

body

type

scheduled_at

read_at

created_at

---

# Devices

Table

devices

Columns

id

user_id

device_token

platform

app_version

last_active

---

# Subscriptions

Table

subscriptions

Columns

id

user_id

plan

status

purchase_provider

purchase_id

start_date

expiry_date

auto_renew

created_at

---

# Feature Usage

Table

feature_usage

Purpose

Track free plan limits.

Columns

id

user_id

feature

usage_count

month

updated_at

Example

feature

daily_scan

usage_count

5

---

# App Settings

Table

user_settings

Columns

id

user_id

daily_scan_reminder

morning_reminder

night_reminder

language

theme

timezone

---

# Analytics Events

Table

analytics_events

Columns

id

user_id

event_name

event_data (JSONB)

created_at

Examples

scan_started

scan_completed

routine_completed

subscription_upgraded

ai_chat_used

---

# API Cache

Table

analysis_cache

Purpose

Prevent duplicate AI analysis.

Columns

id

image_hash

analysis_json

expires_at

---

# File Storage

Cloudflare R2

Folder Structure

/users/{userId}/profile/

/users/{userId}/scans/

/users/{userId}/thumbnails/

Images should never be stored inside PostgreSQL.

Only URLs.

---

# Relationships

User

↓

Profile

↓

Skin Scans

↓

Skin Analysis

↓

AI Insights

↓

Progress

↓

Dashboard

Routine

↓

Routine Items

↓

Routine Logs

↓

Progress

Subscription

↓

Feature Usage

↓

Access Control

---

# Soft Delete Strategy

Never permanently delete immediately.

Every major table includes

deleted_at

Background jobs permanently remove expired data.

---

# Audit Fields

Every table should include

created_at

updated_at

Some tables also include

deleted_at

---

# UUID Strategy

Every primary key uses UUID v4.

Never use incremental IDs.

---

# Performance Indexes

Users

email

Skin Scans

user_id

scan_date

Routine Logs

user_id

completed_at

AI Messages

conversation_id

Subscriptions

user_id

Feature Usage

user_id

feature

---

# Future Tables

These are not part of MVP.

water_logs

sleep_logs

stress_logs

weather_history

product_effectiveness

dermatologists

appointments

family_accounts

before_after_albums

habit_correlations

custom_ai_models

---

# Design Principles

• Normalize relational data.

• Store AI responses in structured format.

• Never store images in the database.

• Use JSONB only for flexible AI metadata.

• Optimize for read performance on Home Dashboard.

• Make the schema scalable for millions of users.
