import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  availabilitySettings as availabilitySettingsTable,
  blockedTimes as blockedTimesTable,
  bookingLinks,
} from "@/db/schema";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.userId, session.user.id))
      .orderBy(desc(bookingLinks.createdAt));

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching booking links:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking links" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, duration, availability, blockedTimes } = body;

    const normalizedTitle = typeof title === "string" ? title.trim() : "";

    if (!normalizedTitle || duration === undefined || duration === null) {
      return NextResponse.json(
        { error: "Title and duration are required" },
        { status: 400 },
      );
    }

    const parsedDuration =
      typeof duration === "string" ? parseInt(duration, 10) : Number(duration);

    if (
      Number.isNaN(parsedDuration) ||
      parsedDuration <= 0 ||
      !Number.isInteger(parsedDuration)
    ) {
      return NextResponse.json(
        { error: "Duration must be a positive number" },
        { status: 400 },
      );
    }

    let availabilityToPersist: {
      startHour: number;
      endHour: number;
      daysOfWeek: number[];
      timezone?: string;
    } | null = null;

    if (availability) {
      const startHour = Number(availability.startHour);
      const endHour = Number(availability.endHour);

      if (
        Number.isNaN(startHour) ||
        Number.isNaN(endHour) ||
        startHour < 0 ||
        startHour > 23 ||
        endHour < 0 ||
        endHour > 23 ||
        startHour >= endHour
      ) {
        return NextResponse.json(
          { error: "Availability hours are invalid" },
          { status: 400 },
        );
      }

      const daysArray: number[] = Array.isArray(availability.daysOfWeek)
        ? availability.daysOfWeek
            .map((day: number) => Number(day))
            .filter((day: number) => Number.isInteger(day) && day >= 0 && day <= 6)
        : [];

      if (daysArray.length === 0) {
        return NextResponse.json(
          { error: "Provide at least one available day" },
          { status: 400 },
        );
      }

      const timezone =
        typeof availability.timezone === "string" &&
        availability.timezone.trim().length > 0
          ? availability.timezone.trim()
          : undefined;

      availabilityToPersist = {
        startHour: Math.floor(startHour),
        endHour: Math.floor(endHour),
        daysOfWeek: Array.from(new Set(daysArray)).sort((a, b) => a - b),
        timezone,
      };
    }

    const blockedTimesToPersist: Array<{
      startTime: Date;
      endTime: Date;
      title: string | null;
    }> = [];

    if (Array.isArray(blockedTimes) && blockedTimes.length > 0) {
      for (const block of blockedTimes) {
        if (!block?.startTime || !block?.endTime) {
          return NextResponse.json(
            { error: "Blocked times require start and end values" },
            { status: 400 },
          );
        }

        const startTime = new Date(block.startTime);
        const endTime = new Date(block.endTime);

        if (
          Number.isNaN(startTime.getTime()) ||
          Number.isNaN(endTime.getTime()) ||
          startTime >= endTime
        ) {
          return NextResponse.json(
            { error: "Blocked time range is invalid" },
            { status: 400 },
          );
        }

        blockedTimesToPersist.push({
          startTime,
          endTime,
          title:
            typeof block.title === "string" && block.title.trim().length > 0
              ? block.title.trim()
              : null,
        });
      }
    }

    // Generate a unique slug
    const slug = nanoid(10).toLowerCase();

    const bookingLink = await db.transaction(async (tx) => {
      const [createdLink] = await tx
        .insert(bookingLinks)
        .values({
          id: nanoid(),
          userId: session.user.id,
          slug,
          title: normalizedTitle,
          description:
            typeof description === "string" && description.trim().length > 0
              ? description.trim()
              : null,
          duration: parsedDuration,
          isActive: true,
        })
        .returning();

      if (availabilityToPersist) {
        await tx.insert(availabilitySettingsTable).values({
          id: nanoid(),
          bookingLinkId: createdLink.id,
          startHour: availabilityToPersist.startHour,
          endHour: availabilityToPersist.endHour,
          daysOfWeek: JSON.stringify(availabilityToPersist.daysOfWeek),
          timezone:
            availabilityToPersist.timezone ??
            Intl.DateTimeFormat().resolvedOptions().timeZone ??
            "UTC",
        });
      }

      if (blockedTimesToPersist.length > 0) {
        await tx.insert(blockedTimesTable).values(
          blockedTimesToPersist.map((block) => ({
            id: nanoid(),
            bookingLinkId: createdLink.id,
            startTime: block.startTime,
            endTime: block.endTime,
            title: block.title,
          })),
        );
      }

      return createdLink;
    });

    return NextResponse.json({ bookingLink }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking link:", error);
    return NextResponse.json(
      { error: "Failed to create booking link" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body ?? {};

    if (typeof id !== "string" || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "id and isActive are required" },
        { status: 400 },
      );
    }

    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, id))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (bookingLink.isActive === isActive) {
      return NextResponse.json({ bookingLink }, { status: 200 });
    }

    const [updated] = await db
      .update(bookingLinks)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(bookingLinks.id, id))
      .returning();

    return NextResponse.json({ bookingLink: updated });
  } catch (error) {
    console.error("Error updating booking link:", error);
    return NextResponse.json(
      { error: "Failed to update booking link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 },
      );
    }

    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, id))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.delete(bookingLinks).where(eq(bookingLinks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking link:", error);
    return NextResponse.json(
      { error: "Failed to delete booking link" },
      { status: 500 },
    );
  }
}
