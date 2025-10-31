---
title: Integrating Google OAuth and Calendar into MeetMe
date: 2025-10-30
description: A behind-the-scenes look at how MeetMe uses Google Cloud to authenticate users and surface their calendars.
---

# Integrating Google OAuth and Calendar into MeetMe

Ship fast, make it seamless, keep it secure—that was the mantra while wiring Google OAuth and Calendar into MeetMe. This post walks through the journey from the initial Google Cloud Platform (GCP) setup to the polished user experience that lets people sign in and see their availability in seconds.

## Laying the Groundwork in GCP

Before writing a line of code, the foundation needed to be right inside Google Cloud:

- **Project structure:** Everything lives inside a dedicated GCP project so OAuth consent, Calendar usage, logging, and quotas stay under one roof.
- **API enablement:** The `Google Calendar API` and `OAuth consent screen` were enabled together, ensuring scopes requested by the app are actually available.
- **OAuth credentials:** A web client ID and secret were generated specifically for the Next.js frontend, locked to `https://meetme.blackie.dev` and `http://localhost:3000` to prevent token misuse.
- **Service automation:** A service account with domain-wide delegation handles nightly sync tasks, so busy slots stay accurate even when a user is offline.

## Making OAuth Feel Effortless

MeetMe leans on `next-auth` to manage the OAuth flow without reinventing the wheel:

- **Provider configuration:** Google is registered with scopes for `openid`, `email`, `profile`, and `https://www.googleapis.com/auth/calendar.events`, unlocking full CRUD access so MeetMe can surface availability and write back confirmed meetings.
- **Token persistence:** Access and refresh tokens are folded into the NextAuth session, giving both the client and server secure access without spreading credentials around.
- **Automatic refresh:** A custom `jwt` callback watches token expiry timestamps and silently trades refresh tokens for new access tokens, so users aren’t stuck reauthenticating.
- **Secret hygiene:** Credentials stay in `.env.local` and are surfaced with `process.env`, keeping them out of the repository and out of the UI bundle.

## Syncing Calendar Data Reliably

Authentication is only half the story—the data pipeline needs to be fast and accurate:

- **Typed API wrapper:** A small `GoogleCalendarClient` wraps the official `googleapis` client, delivering strongly typed helpers such as `listPrimaryEvents`, `insertEvent`, and `patchEvent` to the rest of the app.
- **Route handlers:** Server-side route handlers under `app/api/calendar/route.ts` fetch events on demand and apply short-lived caching through `@vercel/edge-config`, so the UI stays responsive.
- **Background refresh:** GCP Cloud Scheduler pings a secured cron endpoint nightly to pre-fetch busy slots, reconcile updated meetings, and store the results in Postgres for the booking flow.

## Turning Data into Experience

With OAuth and data sync in place, the UI work ties it all together:

- **Functional components:** React hooks fetch from `api/calendar` and render the results using shadcn UI primitives like `Card`, `Badge`, and a custom timeline component.
- **Availability intelligence:** Google’s busy blocks are merged with MeetMe’s own bookings, and newly booked meetings are pushed back to Google Calendar, producing a single, reliable view of free time during scheduling.
- **Resilient UX:** If tokens are revoked or scopes change, the UI detects the condition, prompts the user to reauthenticate, and logs the event to Sentry for follow-up.

## Security and Compliance Guardrails

Building on Google’s ecosystem doesn’t remove responsibility—it heightens it:

- **Least privilege:** End-user sessions receive read-only calendar visibility, while write operations (create, update, delete) run through the MeetMe-managed service account to maintain control without over-scoping individual users.
- **Consent clarity:** The OAuth consent screen is branded and verified, preventing “unverified app” warnings and boosting trust.
- **Audit visibility:** Stackdriver logging captures OAuth grants and API usage patterns so anomalies can be spotted quickly.

## Impact

The integration delivers tangible wins:

- New users can fully onboard with Google in under 30 seconds.
- Calendar fetches average 1.3 seconds thanks to caching and background refresh.
- Support tickets dropped because token refreshes, error states, and calendar CRUD conflicts resolve themselves proactively.

Bringing Google OAuth and Calendar into MeetMe wasn’t just about checking boxes—it was about building an experience that feels native to Google users while maintaining the control and insight we need to run the platform responsibly. If you’d like to see code snippets or architecture diagrams, let me know and I’ll happily share more.


