# Security & Privacy

# SkinCoach

Version: 1.0

---

# Overview

SkinCoach is built with a privacy-first approach.

Users trust us with highly sensitive personal data, including facial images and skin analysis.

Our responsibility is to protect that data using modern security best practices.

Security is considered at every layer:

- Mobile App
- API
- Database
- Cloud Storage
- AI Services
- Infrastructure

---

# Security Principles

• Privacy by Design

• Least Privilege Access

• End-to-End Encryption

• Secure Defaults

• Zero Trust Architecture

• No Sensitive Data Exposure

---

# Authentication

Supported Methods

- Email & Password
- Google Sign-In
- Apple Sign-In

Authentication uses

JWT Access Token

Refresh Token

Passwords

BCrypt Hashing

Never store plaintext passwords.

---

# Authorization

Every API validates

User Identity

User Ownership

Subscription Access

Resource Permissions

Users can only access their own data.

---

# Image Security

User selfies are stored in Cloudflare R2.

Images are never publicly accessible.

Every image uses a signed URL.

Signed URLs expire automatically.

Only authenticated users can request access to their own images.

---

# Data Encryption

In Transit

HTTPS (TLS 1.3)

At Rest

Database Encryption

Cloud Storage Encryption

Device Storage Encryption

Never send data over HTTP.

---

# Sensitive Data

Sensitive data includes

- Facial Images
- Skin Analysis
- Personal Profile
- Authentication Tokens
- Subscription Information

These require additional protection.

---

# Secure Storage (Mobile)

Use MMKV Secure Storage for

- Access Token
- Refresh Token
- User Session

Never store

Passwords

Raw Images

Sensitive API Responses

---

# API Security

All APIs require

HTTPS

JWT Authentication

Rate Limiting

Input Validation

Request Sanitization

File Validation

Response Validation

---

# File Upload Validation

Allowed Formats

JPEG

PNG

Maximum Size

8 MB

Maximum Resolution

6000 × 6000

Reject

Executable Files

GIF

Videos

Corrupted Images

---

# AI Privacy

Images are sent only for analysis.

Images are never used to train AI models.

AI responses are stored only for the user's benefit.

Do not retain AI request payloads longer than necessary.

---

# Database Security

Use parameterized queries.

Never allow raw SQL from user input.

Use Prisma ORM.

Enable automatic backups.

Encrypt backups.

---

# Access Control

Roles

User

Admin

Support (Limited)

Admins cannot access user images unless explicitly authorized for support purposes.

All administrative access must be logged.

---

# Audit Logs

Record

Login

Logout

Password Changes

Subscription Changes

Account Deletion

Profile Updates

Image Uploads

Audit logs should not contain sensitive image data.

---

# Rate Limiting

Authentication

10 requests/minute

AI Scan

10 requests/hour

AI Chat

60 requests/hour

General API

100 requests/minute

---

# Data Retention

Skin Scans

Stored until user deletes them.

AI Analysis

Stored until account deletion.

Account Data

Deleted within 30 days after user requests deletion.

Backups

Retained for 30 days.

---

# Account Deletion

Users can permanently delete their account.

Deletion removes

Profile

Scans

Images

AI Results

Routine

Notifications

Chat History

Subscriptions (after store cancellation)

Deletion should be irreversible after the retention period.

---

# Privacy Controls

Users can

Download their data

Delete individual scans

Delete all scans

Delete their account

Manage notification preferences

---

# Compliance

Design the system to support

GDPR

CCPA

Apple App Store Privacy Requirements

Google Play Data Safety Requirements

---

# Logging

Never log

Passwords

JWT Tokens

Facial Images

AI Request Payloads

Payment Details

Use structured logging for debugging.

---

# Payment Security

Use

Apple In-App Purchase

Google Play Billing

Never store

Credit Card Numbers

Payment Credentials

Use only verified purchase receipts.

---

# Secrets Management

Store secrets in environment variables.

Examples

JWT Secret

Database URL

Gemini API Key

Cloudflare Credentials

Never commit secrets to Git.

---

# Security Headers

Enable

HSTS

X-Content-Type-Options

X-Frame-Options

Content Security Policy

Referrer Policy

---

# Backup Strategy

Daily Database Backup

Encrypted Storage

30-Day Retention

Regular Restore Testing

---

# Monitoring

Monitor

Failed Logins

Suspicious API Usage

Large Upload Attempts

Repeated Scan Failures

Unauthorized Access Attempts

Set alerts for unusual activity.

---

# Incident Response

If a security incident occurs

1. Detect

2. Contain

3. Investigate

4. Notify affected users (if required)

5. Recover

6. Review and improve

---

# Privacy Policy Highlights

Clearly explain

What data is collected

Why it is collected

How it is used

How long it is stored

How users can delete it

Who it is shared with

Transparency builds trust.

---

# Future Enhancements

Multi-Factor Authentication (MFA)

Biometric App Lock

Device Management

Suspicious Login Detection

End-to-End Encrypted Backups

SOC 2 Compliance

ISO 27001 Readiness

---

# Security Checklist

✓ HTTPS Everywhere

✓ JWT Authentication

✓ Encrypted Storage

✓ Signed Image URLs

✓ Secure Password Hashing

✓ Input Validation

✓ Rate Limiting

✓ Audit Logging

✓ Secure Secrets Management

✓ Account Deletion

✓ Data Export

✓ Backup & Recovery

---

# Final Principle

User trust is more valuable than any feature.

Every security decision should answer one question:

"Would I feel comfortable storing my own facial images in this system?"

If the answer is no, redesign the solution before shipping.