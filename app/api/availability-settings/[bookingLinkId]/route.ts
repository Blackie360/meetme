import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { availabilitySettings, bookingLinks } from "@/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingLinkId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingLinkId } = await params;

    // Verify booking link belongs to user
    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, bookingLinkId))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [settings] = await db
      .select()
      .from(availabilitySettings)
      .where(eq(availabilitySettings.bookingLinkId, bookingLinkId))
      .limit(1);

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        settings: {
          startHour: 9,
          endHour: 17,
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }

    return NextResponse.json({
      settings: {
        ...settings,
        daysOfWeek: JSON.parse(settings.daysOfWeek),
      },
    });
  } catch (error) {
    console.error("Error fetching availability settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability settings" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingLinkId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingLinkId } = await params;
    const body = await request.json();
    const { startHour, endHour, daysOfWeek, timezone } = body;

    // Verify booking link belongs to user
    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, bookingLinkId))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if settings already exist
    const [existing] = await db
      .select()
      .from(availabilitySettings)
      .where(eq(availabilitySettings.bookingLinkId, bookingLinkId))
      .limit(1);

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(availabilitySettings)
        .set({
          startHour: startHour ?? existing.startHour,
          endHour: endHour ?? existing.endHour,
          daysOfWeek: daysOfWeek
            ? JSON.stringify(daysOfWeek)
            : existing.daysOfWeek,
          timezone: timezone ?? existing.timezone,
          updatedAt: new Date(),
        })
        .where(eq(availabilitySettings.id, existing.id))
        .returning();

      return NextResponse.json({
        settings: {
          ...updated,
          daysOfWeek: JSON.parse(updated.daysOfWeek),
        },
      });
    }

    // Create new
    const [settings] = await db
      .insert(availabilitySettings)
      .values({
        id: nanoid(),
        bookingLinkId,
        startHour: startHour ?? 9,
        endHour: endHour ?? 17,
        daysOfWeek: daysOfWeek
          ? JSON.stringify(daysOfWeek)
          : JSON.stringify([1, 2, 3, 4, 5]),
        timezone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .returning();

    return NextResponse.json(
      {
        settings: {
          ...settings,
          daysOfWeek: JSON.parse(settings.daysOfWeek),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving availability settings:", error);
    return NextResponse.json(
      { error: "Failed to save availability settings" },
      { status: 500 },
    );
  }
}

