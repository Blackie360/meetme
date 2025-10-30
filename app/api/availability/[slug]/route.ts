import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { bookingLinks } from "@/db/schema";
import { checkAvailability } from "@/lib/google-calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

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

    // Parse date and ensure it's treated as local date (not UTC)
    // The dateParam is in format YYYY-MM-DD
    const dateParts = dateParam.split("-");
    if (dateParts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2], 10);

    const date = new Date(year, month, day);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Check availability for the user's calendar
    const availableSlots = await checkAvailability(bookingLink.id, {
      duration: bookingLink.duration,
      date,
    });

    return NextResponse.json({
      availableSlots: availableSlots.map((slot) => slot.toISOString()),
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 },
    );
  }
}
