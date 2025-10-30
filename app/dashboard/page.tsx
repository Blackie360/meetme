"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Copy, Calendar, Plus, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { signOut, useSession } from "@/lib/auth-client";
import { AvailabilitySettings } from "@/components/booking/availability-settings";
import { BlockedTimesManager } from "@/components/booking/blocked-times-manager";

interface BookingLink {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: number;
  isActive: boolean;
  createdAt: Date;
}

interface Booking {
  id: string;
  title: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [bookingLinks, setBookingLinks] = useState<BookingLink[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [newLinkDuration, setNewLinkDuration] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBookingLinks();
      fetchBookings();
    }
  }, [session?.user]);

  const fetchBookingLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch("/api/booking-links");
      if (response.ok) {
        const data = await response.json();
        setBookingLinks(data.links || []);
      }
    } catch (error) {
      console.error("Error fetching booking links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkDuration) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/booking-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newLinkTitle,
          description: newLinkDescription || undefined,
          duration: newLinkDuration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingLinks([data.bookingLink, ...bookingLinks]);
        setNewLinkTitle("");
        setNewLinkDescription("");
        setNewLinkDuration("30");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating booking link:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyBookingLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
  };

  const userDisplayName = useMemo(() => {
    if (!session?.user) {
      return null;
    }
    return session.user.name || session.user.email || "User";
  }, [session?.user]);

  const userInitial = useMemo(() => {
    if (!session?.user) {
      return "?";
    }
    const source = session.user.name || session.user.email || "?";
    return source.substring(0, 1).toUpperCase();
  }, [session?.user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              M
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-tight">MeetMe</p>
              <p className="text-sm text-muted-foreground">
                Scheduling without the friction
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/60 px-3 py-1.5">
              <Avatar className="size-8">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={userDisplayName ?? "User avatar"}
                />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {userDisplayName}
                </span>
                {session.user.email ? (
                  <span className="text-xs text-muted-foreground leading-tight">
                    {session.user.email}
                  </span>
                ) : null}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:px-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {userDisplayName}!
          </p>
        </div>

        {/* Create Booking Link */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Booking Links</CardTitle>
                <CardDescription>
                  Create shareable links for guests to book meetings
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
              >
                <Plus className="mr-2 size-4" />
                {showCreateForm ? "Cancel" : "New Link"}
              </Button>
            </div>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="e.g., 30 Minute Meeting"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newLinkDescription}
                    onChange={(e) => setNewLinkDescription(e.target.value)}
                    placeholder="Optional description"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newLinkDuration}
                    onChange={(e) => setNewLinkDuration(e.target.value)}
                    min="15"
                    step="15"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Link"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Booking Links List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Booking Links</CardTitle>
            <CardDescription>
              Share these links with guests to let them book meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLinks ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : bookingLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No booking links yet. Create one above!
              </p>
            ) : (
              <div className="space-y-4">
                {bookingLinks.map((link) => {
                  const bookingUrl = `${window.location.origin}/book/${link.slug}`;
                  const isExpanded = expandedLinkId === link.id;
                  return (
                    <div
                      key={link.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{link.title}</h3>
                            {link.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {link.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {link.description}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            Duration: {link.duration} minutes
                          </p>
                          <p className="mt-2 text-sm font-mono text-muted-foreground">
                            {bookingUrl}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedLinkId(
                                isExpanded ? null : link.id,
                              )
                            }
                          >
                            <Settings className="mr-2 size-4" />
                            {isExpanded ? "Hide" : "Settings"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyBookingLink(link.slug)}
                          >
                            <Copy className="mr-2 size-4" />
                            Copy Link
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
                          <AvailabilitySettings bookingLinkId={link.id} />
                          <BlockedTimesManager bookingLinkId={link.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>
              Your scheduled meetings and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming bookings yet.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.title}</h3>
                        <Badge variant="secondary">{booking.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        With: {booking.guestName} ({booking.guestEmail})
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <Calendar className="mr-1 inline size-4" />
                        {format(new Date(booking.startTime), "PPP 'at' p")} -{" "}
                        {format(new Date(booking.endTime), "p")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
