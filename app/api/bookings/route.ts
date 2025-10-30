import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, bookingLinks, users } from "@/db/schema";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendBookingConfirmations } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBookings = await db
      .select({
        id: bookings.id,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        title: bookingLinks.title,
      })
      .from(bookings)
      .innerJoin(bookingLinks, eq(bookings.bookingLinkId, bookingLinks.id))
      .where(eq(bookings.userId, session.user.id))
      .orderBy(desc(bookings.startTime));

    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      guestName,
      guestEmail,
      guestNotes,
      startTime,
    }: {
      slug: string;
      guestName: string;
      guestEmail: string;
      guestNotes?: string;
      startTime: string;
    } = body;

    if (!slug || !guestName || !guestEmail || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get booking link
    const [bookingLink] = await db
      .select()
      .from(bookingLinks)
      .where(eq(bookingLinks.slug, slug))
      .limit(1);

    if (!bookingLink || !bookingLink.isActive) {
      return NextResponse.json(
        { error: "Booking link not found" },
        { status: 404 },
      );
    }

    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, bookingLink.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + bookingLink.duration * 60 * 1000);

    // Create calendar event
    let calendarEventId: string | null = null;
    try {
      calendarEventId = await createCalendarEvent(bookingLink.userId, {
        summary: bookingLink.title,
        description: bookingLink.description || undefined,
        startTime: start,
        endTime: end,
        guestEmail,
        guestName,
        hostEmail: user.email,
      });
    } catch (error) {
      console.error("Error creating calendar event:", error);
      // Continue even if calendar event creation fails
    }

    // Create booking in database
    const [booking] = await db
      .insert(bookings)
      .values({
        id: nanoid(),
        bookingLinkId: bookingLink.id,
        userId: bookingLink.userId,
        guestName,
        guestEmail,
        guestNotes: guestNotes || null,
        startTime: start,
        endTime: end,
        calendarEventId,
        status: "confirmed",
      })
      .returning();

    // Send confirmation emails
    try {
      await sendBookingConfirmations({
        guestName,
        guestEmail,
        hostName: user.name || user.email,
        hostEmail: user.email,
        startTime: start,
        endTime: end,
        title: bookingLink.title,
        description: bookingLink.description || undefined,
      });
    } catch (error) {
      console.error("Error sending confirmation emails:", error);
      // Continue even if email sending fails
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
