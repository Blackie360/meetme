import { google } from "googleapis";
import { nanoid } from "nanoid";
import { eq, and, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  accounts,
  availabilitySettings,
  blockedTimes,
  bookingLinks,
} from "@/db/schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  );
}

/**
 * Get OAuth2 client for Google Calendar API
 */
function getOAuth2Client() {
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    nextAuthUrl ? `${nextAuthUrl}/api/auth/callback/google` : undefined,
  );
}

/**
 * Get access token for a user from the database
 */
async function getAccessToken(userId: string): Promise<string | null> {
  const [account] = await db
    .select({
      accessToken: accounts.accessToken,
      refreshToken: accounts.refreshToken,
      accessTokenExpiresAt: accounts.accessTokenExpiresAt,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  if (!account || !account.accessToken) {
    return null;
  }

  // Check if token is expired and refresh if needed
  if (
    account.accessTokenExpiresAt &&
    account.accessTokenExpiresAt < new Date()
  ) {
    if (!account.refreshToken) {
      return null;
    }
    return await refreshAccessToken(userId, account.refreshToken);
  }

  return account.accessToken;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(
  userId: string,
  refreshToken: string,
): Promise<string | null> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccessToken = credentials.access_token;

    if (!newAccessToken) {
      return null;
    }

    // Update the access token in database
    await db
      .update(accounts)
      .set({
        accessToken: newAccessToken,
        accessTokenExpiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      })
      .where(eq(accounts.userId, userId));

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

/**
 * Get authenticated calendar client for a user
 */
async function getCalendarClient(userId: string) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) {
    throw new Error("Failed to get access token for user");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Fetch calendar events for a user within a time range
 */
export async function getCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<Array<{ start: Date; end: Date }>> {
  try {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return events
      .map((event) => {
        const start = event.start?.dateTime || event.start?.date;
        const end = event.end?.dateTime || event.end?.date;

        if (!start || !end) {
          return null;
        }

        return {
          start: new Date(start),
          end: new Date(end),
        };
      })
      .filter(
        (event): event is { start: Date; end: Date } => event !== null,
      );
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

/**
 * Create a calendar event for a booking
 * Includes both host and guest as attendees and sends updates to both
 * Returns the event ID and meeting link (if conference data was created)
 */
export async function createCalendarEvent(
  userId: string,
  {
    summary,
    description,
    startTime,
    endTime,
    guestEmail,
    guestName,
    hostEmail,
  }: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    guestEmail: string;
    guestName: string;
    hostEmail?: string;
  },
): Promise<{ eventId: string; meetingLink?: string }> {
  try {
    const calendar = await getCalendarClient(userId);

    const attendees = [
      {
        email: guestEmail,
        displayName: guestName,
      },
    ];

    // Add host email if provided to ensure both receive invites
    if (hostEmail) {
      attendees.push({
        email: hostEmail,
        displayName: "Host",
      });
    }

    const requestId = `meetme-${nanoid()}`;

    const event = {
      summary,
      description: description || undefined,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 15 }, // 15 minutes before
        ],
      },
    };

    // First, try to create event with conference data (Google Meet link)
    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          ...event,
          conferenceData: {
            createRequest: {
              requestId,
            },
          },
        },
        conferenceDataVersion: 1,
        sendUpdates: "all", // Send invites to all attendees
      });

      if (!response.data.id) {
        throw new Error("Failed to create calendar event");
      }

      // Extract meeting link from conference data
      const meetingLink =
        response.data.conferenceData?.entryPoints?.[0]?.uri || undefined;

      return {
        eventId: response.data.id,
        meetingLink,
      };
    } catch (error: any) {
      // Check if error is due to insufficient scopes
      const isScopeError =
        error?.code === 403 &&
        (error?.message?.includes("insufficient authentication scopes") ||
          error?.message?.includes("insufficient authentication"));

      if (isScopeError) {
        console.warn(
          "Insufficient scopes for conference data. Creating event without Google Meet link. User may need to re-authenticate with calendar scope.",
        );
        // Retry without conference data
        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
          sendUpdates: "all", // Send invites to all attendees
        });

        if (!response.data.id) {
          throw new Error("Failed to create calendar event");
        }

        return {
          eventId: response.data.id,
          // No meeting link when created without conference data
        };
      }

      // If it's not a scope error, throw the original error
      throw error;
    }
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

/**
 * Check available time slots for a booking link
 * Returns available slots considering:
 * - Custom availability settings (working hours, days of week)
 * - Blocked times
 * - Existing calendar events
 */
export async function checkAvailability(
  bookingLinkId: string,
  {
    duration,
    date,
    bufferMinutes = 15,
  }: {
    duration: number; // Duration in minutes
    date: Date;
    bufferMinutes?: number;
  },
): Promise<Date[]> {
  // Get availability settings for this booking link
  const [settings] = await db
    .select()
    .from(availabilitySettings)
    .where(eq(availabilitySettings.bookingLinkId, bookingLinkId))
    .limit(1);

  const startHour = settings?.startHour ?? 9;
  const endHour = settings?.endHour ?? 17;
  let daysOfWeek: number[] = [1, 2, 3, 4, 5]; // Default: Monday to Friday
  
  if (settings?.daysOfWeek) {
    try {
      daysOfWeek = JSON.parse(settings.daysOfWeek);
    } catch (error) {
      console.error("Error parsing daysOfWeek:", error);
      // Use default if parsing fails
    }
  }

  // Check if the selected day is in the allowed days of week
  // JavaScript getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  const dayOfWeek = date.getDay();
  if (!daysOfWeek.includes(dayOfWeek)) {
    console.log(`Day ${dayOfWeek} not in allowed days:`, daysOfWeek);
    return []; // No availability on this day
  }

  // Get booking link to get userId
  const [bookingLink] = await db
    .select({ userId: bookingLinks.userId })
    .from(bookingLinks)
    .where(eq(bookingLinks.id, bookingLinkId))
    .limit(1);

  if (!bookingLink) {
    return [];
  }

  // Get start and end of the day in local timezone
  // Create dates in local timezone to avoid issues
  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0, 0);

  // Fetch existing calendar events for this day
  let existingEvents: Array<{ start: Date; end: Date }> = [];
  try {
    existingEvents = await getCalendarEvents(
      bookingLink.userId,
      dayStart,
      dayEnd,
    );
  } catch (error) {
    console.error("Error fetching calendar events, continuing without calendar check:", error);
    // Continue without calendar events - assume calendar is available
    // This allows bookings even if calendar API fails
  }

  // Fetch blocked times for this booking link that overlap with this day
  const blocked = await db
    .select()
    .from(blockedTimes)
    .where(
      and(
        eq(blockedTimes.bookingLinkId, bookingLinkId),
        lte(blockedTimes.startTime, dayEnd),
        gte(blockedTimes.endTime, dayStart),
      ),
    );

  // Generate potential slots
  const slots: Date[] = [];
  const slotDuration = duration + bufferMinutes; // Add buffer time

  let currentTime = new Date(dayStart);

  while (currentTime.getTime() + slotDuration * 60 * 1000 <= dayEnd.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

    // Check if this slot conflicts with any existing calendar event
    const hasCalendarConflict = existingEvents.some((event) => {
      const eventStart = event.start.getTime();
      const eventEnd = event.end.getTime();
      const slotStart = currentTime.getTime();
      const slotEndTime = slotEnd.getTime();

      // Check for overlap
      return (
        (slotStart >= eventStart && slotStart < eventEnd) ||
        (slotEndTime > eventStart && slotEndTime <= eventEnd) ||
        (slotStart <= eventStart && slotEndTime >= eventEnd)
      );
    });

    // Check if this slot conflicts with any blocked time
    const hasBlockedConflict = blocked.some((block) => {
      const blockStart = new Date(block.startTime).getTime();
      const blockEnd = new Date(block.endTime).getTime();
      const slotStart = currentTime.getTime();
      const slotEndTime = slotEnd.getTime();

      // Check for overlap
      return (
        (slotStart >= blockStart && slotStart < blockEnd) ||
        (slotEndTime > blockStart && slotEndTime <= blockEnd) ||
        (slotStart <= blockStart && slotEndTime >= blockEnd)
      );
    });

    if (!hasCalendarConflict && !hasBlockedConflict) {
      slots.push(new Date(currentTime));
    }

    // Move to next slot (30-minute intervals)
    currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
  }

  console.log(`Found ${slots.length} available slots for ${date.toISOString()} (startHour: ${startHour}, endHour: ${endHour}, dayOfWeek: ${dayOfWeek}, allowedDays: ${daysOfWeek.join(',')})`);

  return slots;
}

