import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookingLinks } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

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
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, duration } = body;

    if (!title || !duration) {
      return NextResponse.json(
        { error: "Title and duration are required" },
        { status: 400 },
      );
    }

    // Generate a unique slug
    const slug = nanoid(10).toLowerCase();

    const [bookingLink] = await db
      .insert(bookingLinks)
      .values({
        id: nanoid(),
        userId: session.user.id,
        slug,
        title,
        description: description || null,
        duration: parseInt(duration, 10),
        isActive: true,
      })
      .returning();

    return NextResponse.json({ bookingLink }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking link:", error);
    return NextResponse.json(
      { error: "Failed to create booking link" },
      { status: 500 },
    );
  }
}
