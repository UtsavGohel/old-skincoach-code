# Notification Flow

# SkinCoach

Version: 1.0

Push Provider

Firebase Cloud Messaging (FCM)

Local Notifications

Expo Notifications

---

# Overview

Notifications should encourage healthy skincare habits.

They should feel like a helpful coach, not an annoying reminder.

Users should always have full control over notification preferences.

---

# Notification Types

Daily Scan Reminder

Routine Reminder

AI Insight

Weekly Summary

Achievement

Subscription

System

---

# Daily Scan Reminder

Purpose

Encourage users to complete today's skin scan.

Default Time

9:00 AM (User can change)

Examples

✨ Time for today's skin scan.

🌿 Let's see how your skin is doing today.

📷 Your daily scan takes less than 30 seconds.

---

# Morning Routine Reminder

Default

8:00 AM

Examples

☀️ Good morning! Time for your skincare routine.

🌿 Start your day with healthy skin.

---

# Night Routine Reminder

Default

9:00 PM

Examples

🌙 Don't forget your night routine.

✨ Healthy skin starts with consistency.

---

# Weekly Summary

Every Sunday

7:00 PM

Example

📈 Your weekly skin report is ready.

---

# Achievement Notification

Examples

🔥 7-day streak completed!

🏆 You've reached your highest skin score!

🌟 Consistency is paying off!

---

# AI Insight Notification

Triggered after AI analysis completes.

Example

🧠 Your personalized skin insights are ready.

---

# Subscription Notifications

Examples

Your subscription has been renewed.

Your subscription expires in 3 days.

Restore your Premium benefits.

---

# System Notifications

Examples

New feature available.

Maintenance completed.

Privacy policy updated.

---

# Notification Timing

Morning Routine

8:00 AM

Daily Scan

9:00 AM

Night Routine

9:00 PM

Weekly Summary

Sunday 7:00 PM

Users can customize all reminder times.

---

# Smart Notification Rules

Do not send a scan reminder if today's scan is already completed.

Do not send a routine reminder if the routine has already been completed.

Avoid sending notifications after 10:00 PM or before 7:00 AM (local time).

Respect the user's timezone.

---

# User Preferences

Users can enable or disable:

✓ Daily Scan Reminder

✓ Morning Routine Reminder

✓ Night Routine Reminder

✓ Weekly Summary

✓ Achievements

✓ Product Updates

---

# Notification Flow

App Installed

↓

Request Permission

↓

Permission Granted

↓

Register Device Token

↓

Save Token

↓

Schedule Notifications

---

# Device Registration

Store

Device Token

Platform

App Version

Timezone

Language

Last Active

---

# Deep Linking

Daily Scan

→ Camera Screen

Weekly Summary

→ Progress Screen

AI Insight

→ Results Screen

Routine Reminder

→ Routine Screen

Subscription

→ Subscription Screen

---

# Analytics Events

notification_permission_granted

notification_permission_denied

notification_sent

notification_opened

notification_dismissed

deep_link_opened

---

# Retry Strategy

If push delivery fails,

Retry once.

If still unsuccessful,

Wait until the next scheduled notification.

---

# Quiet Hours

Default

10:00 PM – 7:00 AM

Never send promotional notifications during quiet hours.

---

# Personalization

Future versions may personalize reminder times based on user behavior.

Example

If the user usually scans at 8:30 PM,

Suggest moving the reminder closer to that time.

---

# Notification Limits

Maximum

3 notifications per day

Priority Order

1. AI Result Ready

2. Daily Scan Reminder

3. Routine Reminder

4. Achievement

5. Weekly Summary

6. Product Updates

---

# Localization

Support multiple languages.

Notification text should adapt to the user's selected language.

---

# Best Practices

- Keep notifications short.
- Avoid clickbait.
- Never guilt-trip users.
- Celebrate progress.
- Focus on consistency.
- Always provide value.

---

# Success Metrics

Notification Opt-in Rate

Notification Open Rate

Daily Active Users (DAU)

Scan Completion Rate

Routine Completion Rate

7-Day Retention

30-Day Retention

---

# Final Principle

Every notification should answer one question:

"Will this genuinely help the user improve their skincare habits today?"

If the answer is no, don't send it.