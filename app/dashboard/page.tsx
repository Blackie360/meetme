"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Icon } from "@iconify/react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
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

interface PendingBlockedTime {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const router = useRouter();
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
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
  const [availabilityStartHour, setAvailabilityStartHour] = useState(9);
  const [availabilityEndHour, setAvailabilityEndHour] = useState(17);
  const [availabilityDays, setAvailabilityDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [availabilityTimezone, setAvailabilityTimezone] = useState(userTimezone);
  const [pendingBlockedTimes, setPendingBlockedTimes] = useState<PendingBlockedTime[]>([]);
  const [blockedStartInput, setBlockedStartInput] = useState("");
  const [blockedEndInput, setBlockedEndInput] = useState("");
  const [blockedTitleInput, setBlockedTitleInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [blockedTimeError, setBlockedTimeError] = useState<string | null>(null);
  const [linkActionError, setLinkActionError] = useState<string | null>(null);
  const [updatingLinkId, setUpdatingLinkId] = useState<string | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

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

  const resetCreateForm = () => {
    setNewLinkTitle("");
    setNewLinkDescription("");
    setNewLinkDuration("30");
    setAvailabilityStartHour(9);
    setAvailabilityEndHour(17);
    setAvailabilityDays([1, 2, 3, 4, 5]);
    setAvailabilityTimezone(userTimezone);
    setPendingBlockedTimes([]);
    setBlockedStartInput("");
    setBlockedEndInput("");
    setBlockedTitleInput("");
    setFormError(null);
    setBlockedTimeError(null);
  };

  const handleToggleDay = (day: number) => {
    setAvailabilityDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleAddBlockedTime = () => {
    setBlockedTimeError(null);

    if (!blockedStartInput || !blockedEndInput) {
      setBlockedTimeError("Start and end times are required.");
      return;
    }

    const start = new Date(blockedStartInput);
    const end = new Date(blockedEndInput);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setBlockedTimeError("Please provide valid start and end times.");
      return;
    }

    if (start >= end) {
      setBlockedTimeError("End time must be after start time.");
      return;
    }

    const tempId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setPendingBlockedTimes((prev) => [
      ...prev,
      {
        id: tempId,
        startTime: blockedStartInput,
        endTime: blockedEndInput,
        title: blockedTitleInput.trim(),
      },
    ]);

    setBlockedStartInput("");
    setBlockedEndInput("");
    setBlockedTitleInput("");
  };

  const handleRemoveBlockedTime = (id: string) => {
    setPendingBlockedTimes((prev) => prev.filter((block) => block.id !== id));
  };

  const handleToggleActive = async (bookingLinkId: string, nextActive: boolean) => {
    setLinkActionError(null);
    setUpdatingLinkId(bookingLinkId);
    try {
      const response = await fetch("/api/booking-links", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookingLinkId, isActive: nextActive }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update booking link.");
      }

      const data = await response.json();
      setBookingLinks((prev) =>
        prev.map((link) => (link.id === bookingLinkId ? data.bookingLink : link)),
      );
    } catch (error) {
      console.error("Error updating booking link:", error);
      setLinkActionError(
        error instanceof Error ? error.message : "Failed to update booking link.",
      );
    } finally {
      setUpdatingLinkId(null);
    }
  };

  const handleDeleteLink = async (bookingLinkId: string) => {
    setLinkActionError(null);
    setDeletingLinkId(bookingLinkId);
    try {
      const response = await fetch(`/api/booking-links?id=${encodeURIComponent(bookingLinkId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete booking link.");
      }

      setBookingLinks((prev) => prev.filter((link) => link.id !== bookingLinkId));
      if (expandedLinkId === bookingLinkId) {
        setExpandedLinkId(null);
      }
    } catch (error) {
      console.error("Error deleting booking link:", error);
      setLinkActionError(
        error instanceof Error ? error.message : "Failed to delete booking link.",
      );
    } finally {
      setDeletingLinkId(null);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkDuration) return;

    setFormError(null);

    const parsedDuration = parseInt(newLinkDuration, 10);

    if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
      setFormError("Duration must be a positive number of minutes.");
      return;
    }

    if (availabilityDays.length === 0) {
      setFormError("Select at least one day you are available.");
      return;
    }

    if (availabilityStartHour >= availabilityEndHour) {
      setFormError("End hour must be later than start hour.");
      return;
    }

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
          duration: parsedDuration,
          availability: {
            startHour: availabilityStartHour,
            endHour: availabilityEndHour,
            daysOfWeek: [...availabilityDays].sort((a, b) => a - b),
            timezone: availabilityTimezone,
          },
          blockedTimes:
            pendingBlockedTimes.length > 0
              ? pendingBlockedTimes.map((block) => ({
                  startTime: block.startTime,
                  endTime: block.endTime,
                  title: block.title || undefined,
                }))
              : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || "Failed to create booking link.");
        return;
      }

      const data = await response.json();
      setBookingLinks((prev) => [data.bookingLink, ...prev]);
      resetCreateForm();
      setShowCreateForm(false);
      setExpandedLinkId(data.bookingLink.id);
    } catch (error) {
      console.error("Error creating booking link:", error);
      setFormError("Something went wrong while creating the booking link.");
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
      await signOut({ redirect: false });
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
              className="w-full sm:w-auto"
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Booking Links</CardTitle>
                <CardDescription>
                  Create shareable links for guests to book meetings
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                <Icon icon="lucide:plus" className="mr-2 size-4" />
                {showCreateForm ? "Cancel" : "New Link"}
              </Button>
            </div>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateLink} className="space-y-6">
                <Tabs defaultValue="details" className="space-y-6">
                  <TabsList className="w-full flex-wrap justify-start gap-2 sm:justify-center">
                    <TabsTrigger value="details" className="flex-1 sm:flex-none">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="flex-1 sm:flex-none">
                      Availability
                    </TabsTrigger>
                    <TabsTrigger value="blocked" className="flex-1 sm:flex-none">
                      Blocked Times
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4">
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
                  </TabsContent>
                  <TabsContent value="availability" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="startHour">Start Hour (24h)</Label>
                        <Input
                          id="startHour"
                          type="number"
                          min="0"
                          max="23"
                          value={availabilityStartHour}
                          onChange={(e) =>
                            setAvailabilityStartHour(
                              Number.isNaN(Number(e.target.value))
                                ? 0
                                : Math.min(23, Math.max(0, Number(e.target.value))),
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endHour">End Hour (24h)</Label>
                        <Input
                          id="endHour"
                          type="number"
                          min="0"
                          max="23"
                          value={availabilityEndHour}
                          onChange={(e) =>
                            setAvailabilityEndHour(
                              Number.isNaN(Number(e.target.value))
                                ? 0
                                : Math.min(23, Math.max(0, Number(e.target.value))),
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={availabilityTimezone}
                          onChange={(e) => setAvailabilityTimezone(e.target.value)}
                          placeholder="e.g., America/New_York"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Available Days</Label>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = availabilityDays.includes(day.value);
                          return (
                            <div
                              key={day.value}
                              className={cn(
                                "flex items-center justify-between rounded-lg border p-3 transition-colors",
                                isSelected
                                  ? "border-primary/70 bg-primary/10"
                                  : "border-border/60 bg-background",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`day-${day.value}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleDay(day.value)}
                                />
                                <Label htmlFor={`day-${day.value}`} className="cursor-pointer text-sm">
                                  {day.label}
                                </Label>
                              </div>
                              {isSelected && <Badge variant="secondary">On</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="blocked" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="blocked-start">Start time</Label>
                        <Input
                          id="blocked-start"
                          type="datetime-local"
                          value={blockedStartInput}
                          onChange={(e) => setBlockedStartInput(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="blocked-end">End time</Label>
                        <Input
                          id="blocked-end"
                          type="datetime-local"
                          value={blockedEndInput}
                          onChange={(e) => setBlockedEndInput(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="blocked-title">Title (optional)</Label>
                      <Input
                        id="blocked-title"
                        placeholder="e.g., School pickup"
                        value={blockedTitleInput}
                        onChange={(e) => setBlockedTitleInput(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    {blockedTimeError ? (
                      <p className="text-sm text-destructive">{blockedTimeError}</p>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddBlockedTime}
                      disabled={isCreating}
                      className="w-full sm:w-auto"
                    >
                      Add blocked time
                    </Button>
                    {pendingBlockedTimes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Pending blocks</Label>
                        {pendingBlockedTimes.map((block) => {
                          const startDisplay = new Date(block.startTime);
                          const endDisplay = new Date(block.endTime);
                          const startLabel = Number.isNaN(startDisplay.getTime())
                            ? block.startTime
                            : format(startDisplay, "PPP 'at' p");
                          const endLabel = Number.isNaN(endDisplay.getTime())
                            ? block.endTime
                            : format(endDisplay, "PPP 'at' p");
                          return (
                            <div
                              key={block.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {block.title || "Blocked time"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {startLabel} – {endLabel}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBlockedTime(block.id)}
                              >
                                <Icon icon="lucide:x" className="size-4" />
                                <span className="sr-only">Remove blocked time</span>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetCreateForm();
                      setShowCreateForm(false);
                    }}
                    disabled={isCreating}
                    className="w-full sm:w-auto"
                  >
                    Discard
                  </Button>
                  <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                    {isCreating ? "Creating..." : "Create Link"}
                  </Button>
                </div>
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
            {linkActionError ? (
              <p className="mb-4 text-sm text-destructive">{linkActionError}</p>
            ) : null}
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
                  const isUpdating = updatingLinkId === link.id;
                  const isDeleting = deletingLinkId === link.id;
                  const nextActive = !link.isActive;
                  return (
                    <div
                      key={link.id}
                      className="space-y-4 rounded-lg border p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{link.title}</h3>
                            {link.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {link.description && (
                            <p className="text-sm text-muted-foreground">
                              {link.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Duration: {link.duration} minutes
                          </p>
                          <p className="text-sm font-mono text-muted-foreground break-all">
                            {bookingUrl}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedLinkId(
                                isExpanded ? null : link.id,
                              )
                            }
                            className="w-full sm:w-auto"
                          >
                            <Icon icon="lucide:settings" className="mr-2 size-4" />
                            {isExpanded ? "Hide" : "Settings"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyBookingLink(link.slug)}
                            className="w-full sm:w-auto"
                          >
                            <Icon icon="lucide:copy" className="mr-2 size-4" />
                            Copy Link
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex flex-wrap gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant={link.isActive ? "secondary" : "outline"}
                                  size="sm"
                                  disabled={isUpdating}
                                className="w-full sm:w-auto"
                                >
                                  <Icon icon="lucide:power" className="mr-2 size-4" />
                                  {isUpdating
                                    ? "Updating..."
                                    : link.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {link.isActive
                                      ? "Deactivate booking link?"
                                      : "Activate booking link?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {link.isActive
                                      ? "Guests will no longer be able to book new meetings with this link until you reactivate it."
                                      : "Guests will be able to book meetings using this link again."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <Button
                                      variant={link.isActive ? "destructive" : "default"}
                                      onClick={() => void handleToggleActive(link.id, nextActive)}
                                      disabled={isUpdating}
                                      className="w-full sm:w-auto"
                                    >
                                      {link.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isDeleting}
                                className="w-full sm:w-auto"
                                >
                                  <Icon icon="lucide:trash-2" className="mr-2 size-4" />
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete booking link?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the link and any related availability
                                    settings or blocked times.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <Button
                                      variant="destructive"
                                      onClick={() => void handleDeleteLink(link.id)}
                                      disabled={isDeleting}
                                      className="w-full sm:w-auto"
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <AvailabilitySettings bookingLinkId={link.id} />
                            <BlockedTimesManager bookingLinkId={link.id} />
                          </div>
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
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
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
                        <Icon icon="lucide:calendar" className="mr-1 inline size-4" />
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
