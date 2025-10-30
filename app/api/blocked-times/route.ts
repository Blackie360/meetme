import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, and, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { blockedTimes, bookingLinks } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingLinkId = searchParams.get("bookingLinkId");

    if (!bookingLinkId) {
      return NextResponse.json(
        { error: "bookingLinkId is required" },
        { status: 400 },
      );
    }

    // Verify booking link belongs to user
    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, bookingLinkId))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const blocks = await db
      .select()
      .from(blockedTimes)
      .where(eq(blockedTimes.bookingLinkId, bookingLinkId))
      .orderBy(blockedTimes.startTime);

    return NextResponse.json({ blockedTimes: blocks });
  } catch (error) {
    console.error("Error fetching blocked times:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked times" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingLinkId, startTime, endTime, title } = body;

    if (!bookingLinkId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "bookingLinkId, startTime, and endTime are required" },
        { status: 400 },
      );
    }

    // Verify booking link belongs to user
    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.id, bookingLinkId))
      .limit(1);

    if (!bookingLink || bookingLink.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [blocked] = await db
      .insert(blockedTimes)
      .values({
        id: nanoid(),
        bookingLinkId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        title: title || null,
      })
      .returning();

    return NextResponse.json({ blockedTime: blocked }, { status: 201 });
  } catch (error) {
    console.error("Error creating blocked time:", error);
    return NextResponse.json(
      { error: "Failed to create blocked time" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blockedTimeId = searchParams.get("id");

    if (!blockedTimeId) {
      return NextResponse.json(
        { error: "id parameter is required" },
        { status: 400 },
      );
    }

    // Get blocked time and verify booking link belongs to user
    const [blocked] = await db
      .select({
        id: blockedTimes.id,
        bookingLinkId: blockedTimes.bookingLinkId,
        userId: bookingLinks.userId,
      })
      .from(blockedTimes)
      .innerJoin(
        bookingLinks,
        eq(blockedTimes.bookingLinkId, bookingLinks.id),
      )
      .where(eq(blockedTimes.id, blockedTimeId))
      .limit(1);

    if (!blocked || blocked.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.delete(blockedTimes).where(eq(blockedTimes.id, blockedTimeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blocked time:", error);
    return NextResponse.json(
      { error: "Failed to delete blocked time" },
      { status: 500 },
    );
  }
}

