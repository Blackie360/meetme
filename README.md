## MeetMe

AI-assisted scheduling built with Next.js 16, shadcn/ui, Drizzle ORM, and Google Calendar. This guide explains how to run the project locally and how to connect the Google Calendar API through Google Cloud Platform.

---

## Requirements

- Node.js 20+
- pnpm 9+ (project uses pnpm by default)
- PostgreSQL 14+ (local Docker/Postgres service or managed instance)
- Google Cloud project with Calendar API enabled

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd meetme
pnpm install
```

---

## 2. Configure Environment Variables

Create a `.env.local` file at the project root:

```bash
cp .env.example .env.local # create one manually if the template does not exist
```

Populate it with the values your environment needs. Example configuration:

```bash
# App
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-generated-secret

# Database
DATABASE_URL=postgres://username:password@localhost:5432/meetme
DATABASE_SSL=false

# Google OAuth / Calendar
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=example@gmail.com
SMTP_PASSWORD=app-password-or-token
```

> ℹ️  Generate `AUTH_SECRET` with `openssl rand -base64 32`.

---

## 3. Prepare the Database

Run migrations after the database is reachable:

```bash
pnpm db:migrate
```

This applies the SQL files in `drizzle/` to your database.

---

## 4. Run the App Locally

```bash
pnpm dev
```

Visit `http://localhost:3000` to load the landing page. The dashboard, booking links, and API routes require a signed-in Google user with the configured scopes.

---

## 5. Google Calendar Integration (GCP Setup)

Follow these steps to wire up OAuth and Calendar CRUD access:

1. **Create a Google Cloud project** (or reuse an existing one) in the Google Cloud Console.
2. **Enable APIs**: search for and enable **Google Calendar API** and **OAuth consent screen**.
3. **Configure OAuth consent**:
   - Choose External if you need non-domain users.
  - Add the required scopes (Calendar API already selected when using the client below).
  - Provide app logo, support email, and authorized domains.
4. **Create OAuth credentials** → Web application:
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - Your production domain (e.g. `https://meetme.blackie.tech`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-production-domain/api/auth/callback/google`
   - Download or copy the **Client ID** and **Client Secret** into `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. **Service account (optional but recommended)**:
   - Create a service account if you plan to run background sync or administrative tasks.
   - Grant the Calendar API scope `https://www.googleapis.com/auth/calendar`.
   - Store its credentials securely; use them in server-side jobs or scripts (e.g. via Cloud Scheduler) that call MeetMe’s cron endpoints.
6. **Update scopes in production**:
   - The app requests `openid email profile https://www.googleapis.com/auth/calendar`. Users will be prompted for consent the first time they sign in.
   - If you change scopes later, existing users must re-authorize; MeetMe detects insufficient scopes and surfaces reauth prompts automatically.

After the OAuth client is saved, restart the dev server to pick up environment changes.

---

## 6. Email Delivery (Optional)

MeetMe sends booking confirmations via SMTP using Nodemailer. Provide the SMTP credentials in `.env.local`. For Gmail, create an App Password and set `SMTP_SECURE=false`. For services like SendGrid or Postmark, replace host/port and enable TLS if needed.

---

## 7. Helpful Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Start Next.js in development mode. |
| `pnpm build` | Compile a production build. |
| `pnpm start` | Serve the production build locally. |
| `pnpm db:migrate` | Apply Drizzle migrations. |
| `pnpm db:generate` | Regenerate migration SQL from the schema. |
| `pnpm lint` / `pnpm format` | Run Biome checks or format the codebase. |

---

## 8. Deployment Notes

- Deploy to Vercel with `vercel deploy --prod` after running `pnpm build` locally.
- Configure the same environment variables in Vercel’s dashboard (Project Settings → Environment Variables).
- If using a custom domain, add it in Vercel and update `NEXTAUTH_URL` accordingly.

---

## Troubleshooting

- **Calendar requests fail** → confirm the user granted the full Calendar scope; ask them to sign out/in again. Check GCP OAuth consent status if the app is in Testing mode (users must be added as test users).
- **Token refresh issues** → ensure refresh tokens are still valid. Revoking consent in Google revokes refresh tokens; reauth is required.
- **Database connection errors** → verify `DATABASE_URL` and that SSL settings match your provider (`DATABASE_SSL=true` for managed services like Supabase/Neon).
- **Emails not sending** → confirm SMTP credentials, host/port, and whether the provider requires TLS (`SMTP_SECURE=true`).

Reach out to the team or file an issue if you run into something not covered here.

---

## Appendix · How the Stack Works (Code Tour)

### Authentication (Google OAuth via NextAuth)

MeetMe uses a single Google provider configured for offline access and full calendar CRUD. The core setup lives in `lib/auth.ts`:

```ts
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const user = await upsertGoogleAccount({
          account: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            id_token: account.id_token,
            expires_at: account.expires_at,
          },
          profile: profile as GoogleProfile | undefined,
        });

        token.uid = user.id;
        token.email = user.email;
        token.name = user.name ?? token.name;
        token.picture = user.image;
      }

      return token;
    },
  },
};
```

The helper `upsertGoogleAccount` persists tokens, scopes, and expiry metadata in Postgres using Drizzle so future API calls can refresh access tokens automatically.

### Availability Intelligence & Booking Flow

Incoming bookings merge custom availability, blocked times, and Google busy slots. The heavy lifting happens in `lib/google-calendar.ts`:

```ts
export async function checkAvailability(
  bookingLinkId: string,
  { duration, date, bufferMinutes = 15 }: {
    duration: number;
    date: Date;
    bufferMinutes?: number;
  },
): Promise<Date[]> {
  const [settings] = await db
    .select()
    .from(availabilitySettings)
    .where(eq(availabilitySettings.bookingLinkId, bookingLinkId))
    .limit(1);

  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);

  const existingEvents = await getCalendarEvents(
    bookingLink.userId,
    dayStart,
    dayEnd,
  );

  // ...combine Google events + blocked times + buffers
}
```

When a guest confirms a slot, MeetMe writes the meeting back to Google Calendar and emails both parties:

```ts
export async function createCalendarEvent(userId: string, payload: {
  summary: string;
  startTime: Date;
  endTime: Date;
  guestEmail: string;
  guestName: string;
  hostEmail?: string;
}): Promise<{ eventId: string; meetingLink?: string }> {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: payload.summary,
      start: { dateTime: payload.startTime.toISOString(), timeZone },
      end: { dateTime: payload.endTime.toISOString(), timeZone },
      attendees: [
        { email: payload.guestEmail, displayName: payload.guestName },
        payload.hostEmail ? { email: payload.hostEmail, displayName: "Host" } : undefined,
      ].filter(Boolean),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 15 },
        ],
      },
      conferenceData: {
        createRequest: { requestId: `meetme-${nanoid()}` },
      },
    },
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  return {
    eventId: response.data.id!,
    meetingLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
  };
}
```

If Google denies conference creation because the user revoked permissions, the helper retries without Meet links and surfaces a re-auth prompt.

### Building a Cloud-Native Booking System

Key architectural choices referenced in the “Building a Cloud-Native Booking System with Google OAuth & Calendar” notes:

- **Next.js App Router** serves landing, dashboard, and booking flows with React Server Components and shadcn/ui for design consistency.
- **Drizzle ORM + Postgres** persist users, OAuth tokens, booking links, availability windows, and blocked times (`db/schema.ts`).
- **Edge caching** (via `@vercel/edge-config`) and background sync ensure availability data stays fresh without hammering the Calendar API.
- **Service accounts & Cloud Scheduler** (documented in the blog post) run nightly reconciliation jobs so Google data, Postgres, and MeetMe stay in sync even when users are offline.
- **Email pipelines** in `lib/email.ts` leverage Nodemailer to send branded confirmations to both host and guest immediately after a booking.

These snippets, combined with the GCP setup steps above, give you the full blueprint for running MeetMe locally, extending it in production, or adapting the patterns in your own cloud-native scheduling stack.
