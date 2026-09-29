# UI Components Specification

# SkinCoach

Version: 1.0

---

# Purpose

This document defines every reusable UI component used throughout SkinCoach.

All screens must be built using these reusable components to ensure:

- Design consistency
- Faster development
- Easier maintenance
- Scalable architecture

Every component should support Light and Dark mode.

---

# Design Principles

Every component should feel:

• Premium

• Calm

• Minimal

• Spacious

• Organic

• Native iOS & Android

Avoid:

- Material Design look
- Enterprise dashboards
- Heavy borders
- Sharp corners
- Overuse of colors

---

# Global Spacing

Extra Small

4px

Small

8px

Medium

16px

Large

24px

Extra Large

32px

Section Gap

40px

Screen Padding

20px

Safe Area Bottom

24px

---

# Border Radius

Small Components

12px

Input Fields

16px

Buttons

20px

Cards

24px

Bottom Sheet

32px

Modal

32px

Profile Image

Circular

---

# Shadows

Cards

Soft elevation

Opacity

5%

Blur

20px

Y Offset

6px

Buttons

Soft shadow

Opacity

8%

Avoid harsh shadows.

---

# Colors

Primary

Sage Green

Secondary

Soft Mint

Background

Warm Cream

Surface

White

Text Primary

Dark Charcoal

Text Secondary

Medium Gray

Border

Very Light Gray

Success

Soft Green

Warning

Warm Amber

Error

Muted Coral

---

# Typography

Display

32

Bold

Heading

28

SemiBold

Title

22

SemiBold

Body

16

Regular

Caption

14

Regular

Small

12

Regular

Line Height

140%

Letter spacing

Very subtle

---

# Buttons

## Primary Button

Used for

Main CTA

Examples

Start Scan

Continue

Upgrade

Properties

Full Width

56px Height

20px Radius

Sage Background

White Text

Soft Shadow

Pressed State

Scale 98%

Light haptic

---

## Secondary Button

White Background

Dark Text

Light Border

Rounded

Used for

Cancel

Back

Learn More

---

## Text Button

No Background

Sage Text

Used for

Forgot Password

Skip

View Details

---

# Input Fields

Rounded

16px Radius

Soft Border

Floating Label

Leading Icon (optional)

Trailing Icon (optional)

States

Default

Focused

Success

Error

Disabled

---

# Cards

Cards are the primary building block.

Every card should use

24px Radius

White Background

Soft Shadow

20px Padding

Different elevations may indicate hierarchy.

---

## Hero Card

Large

Used for

Skin Score

Today's Summary

AI Insight

---

## Information Card

Used for

Tips

Recommendations

Weekly Summary

---

## Metric Card

Small cards

Examples

Hydration

Acne

Texture

Redness

Pigmentation

---

## Timeline Card

Used inside Progress screen.

Contains

Icon

Date

Title

Description

Optional Image

---

# Progress Ring

Reusable component.

Used for

Skin Score

Routine Completion

Weekly Goal

Properties

Animated

Gradient Stroke

Large Number

Small Label

Optional Badge

---

# Line Chart

Used in

Progress Screen

Weekly Trends

Monthly Trends

Properties

Smooth Curves

Gradient Fill

Minimal Labels

Touch Interaction

Tooltip

---

# Bottom Navigation

Five Tabs

Home

Scan

Progress

Routine

Profile

Center Scan button

Floating

Larger than others

Sage Green

Soft Shadow

Active

Filled Icon

Inactive

Outline Icon

---

# Floating Action Button

56px

Circular

Sage Green

Camera Icon

Soft Shadow

Used only for Scan.

---

# Avatar

Circular

Sizes

40

56

72

120

Support

Photo

Initials

Placeholder

---

# AI Insight Card

Large premium card.

Contains

Illustration

Title

Message

CTA

Optional Badge

Used in

Home

AI Coach

Results

---

# Achievement Badge

Rounded Pill

Small Icon

Title

Optional Date

Supports

Locked

Unlocked

Completed

---

# Progress Timeline

Vertical Layout

Connected Line

Floating Cards

Animated on Scroll

Supports

Milestones

Achievements

Historical Scans

---

# Routine Item

Contains

Checkbox

Product Icon

Product Name

Reminder Time

Optional Notes

Completed State

Check Animation

Glow Effect

Strike-through

---

# Statistic Card

Contains

Icon

Metric

Value

Trend

Examples

Acne

↓ Better

Hydration

↑ Excellent

---

# AI Chat Bubble

Rounded

Large Radius

User

Right Aligned

AI

Left Aligned

Timestamp

Optional

Suggested Replies

Optional

---

# Bottom Sheet

Rounded Top

32px Radius

Blur Background

Drag Indicator

Supports

Forms

Filters

Email Login

Subscriptions

---

# Modal

Centered

Blurred Background

Rounded

Large Padding

Supports

Confirmation

Delete Account

Logout

Subscription Success

---

# Empty State

Contains

Illustration

Title

Description

Primary CTA

Optional Secondary CTA

Used in

Progress

Routine

History

AI Coach

---

# Loading Components

Skeleton Cards

Progress Ring

Shimmer

Animated Placeholder

Avoid traditional loading spinners.

---

# Toast

Rounded

Floating

Bottom Position

Auto Dismiss

Success

Warning

Error

Info

---

# Charts

Supported Charts

Line Chart

Area Chart

Progress Ring

Mini Trend

Avoid

Pie Charts

Bar Charts

Complex Analytics

---

# Icons

Use a single icon library throughout.

Style

Rounded

Minimal

2px Stroke

Consistent Sizes

Avoid mixing icon styles.

---

# Animations

Every component should support subtle animations.

Examples

Fade

Scale

Slide

Count Up

Glow

Progress Fill

Never use bounce animations.

Motion should feel calm.

---

# Haptic Feedback

Use haptics sparingly.

Primary Button

Light

Successful Scan

Medium

Routine Completed

Success

Achievement Unlocked

Success

Subscription Purchased

Heavy

---

# Accessibility

Minimum Touch Target

44x44

Dynamic Font Support

Yes

VoiceOver Support

Yes

Screen Reader Labels

Required

Color Contrast

WCAG AA

---

# Responsive Behavior

Support

Small Phones

Large Phones

Foldables

Tablets (Future)

Maintain spacing proportionally.

---

# Reusability Rules

No screen should create its own custom button.

No screen should create its own card style.

No screen should create unique typography.

Everything must reuse these shared components.

If a new component is needed, add it here first before using it in the application.

---

# Component Hierarchy

Foundation

↓

Typography

Colors

Spacing

↓

Buttons

Inputs

Cards

↓

Charts

Progress Rings

Timeline

↓

Feature Components

↓

Screens

This ensures a scalable and maintainable UI architecture.

---

# Final Principle

A user should feel like every screen belongs to the same premium product.

Every component should communicate:

Luxury.

Trust.

Calmness.

Consistency.

Self-care.

Build components once.

Reuse them everywhere.