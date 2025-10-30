import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bookingLinks } from "@/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

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

    return NextResponse.json({ bookingLink });
  } catch (error) {
    console.error("Error fetching booking link:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking link" },
      { status: 500 },
    );
  }
}
