---
title: Building a Cloud-Native Booking System with Google OAuth & Calendar
date: 2025-10-30
description: Slide deck covering the architecture and learnings from integrating Google OAuth and Calendar into a cloud-native booking platform.
---

# 1. Vision
- Build a booking experience that feels native to Google users
- Keep auth seamless, secure, and fast
- Deliver reliable availability data in real time

# 2. Platform Overview
- Next.js frontend with shadcn UI components
- API routes backed by Postgres and Edge caching
- Google Cloud powers identity and calendar data

# 3. GCP Project Setup
- Dedicated GCP project for auth + calendar services
- Enabled OAuth consent screen and Calendar API
- Restricted credentials to production + localhost origins

# 4. OAuth Flow
- Implemented with next-auth Google provider
- Requested minimal scopes: `openid`, `email`, `profile`, `calendar.events.readonly`
- Stored tokens in secure NextAuth session context

# 5. Token Lifecycle
- Custom JWT callback refreshes tokens before expiry
- Refresh token safely persisted server-side only
- Automatic recovery from revoked or expired tokens

# 6. Calendar Data Pipeline
- `GoogleCalendarClient` wraps `googleapis` for typed access
- API route caches responses via `@vercel/edge-config`
- Service account handles scheduled background syncs and CRUD operations

# 7. Availability Intelligence
- Merge Google busy slots with MeetMe bookings
- Persist computed availability in Postgres for fast reads
- Surface conflicts early to prevent double-booking

# 8. User Experience
- Functional components render timelines with shadcn UI
- Real-time updates on booking pages and dashboards
- Friendly re-auth prompts when scopes change or CRUD permissions are required

# 9. Security & Compliance
- Least-privilege access: end users read-only, service account writes
- Verified OAuth consent screen to avoid warning banners
- Stackdriver audit logs track grants and API usage

# 10. Outcomes & Next Steps
- Onboarding in <30s with Google sign-in
- Calendar fetch latency ~1.3s after caching
- Explore meeting creation via service account + smart suggestions

