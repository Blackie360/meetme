import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { bookingLinks, users } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [bookingLink] = await db
      .select({
        id: bookingLinks.id,
        slug: bookingLinks.slug,
        title: bookingLinks.title,
        description: bookingLinks.description,
        duration: bookingLinks.duration,
        isActive: bookingLinks.isActive,
        userId: bookingLinks.userId,
        hostName: users.name,
        hostEmail: users.email,
        hostImage: users.image,
      })
      .from(bookingLinks)
      .innerJoin(users, eq(bookingLinks.userId, users.id))
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
