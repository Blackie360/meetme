"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BookingLink {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: number;
  userId: string;
  hostName: string | null;
  hostEmail: string;
  hostImage: string | null;
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch booking link details
  useEffect(() => {
    if (!slug) return;

    async function fetchBookingLink() {
      try {
        const response = await fetch(`/api/booking-links/${slug}`);
        if (!response.ok) {
          setError("Booking link not found");
          return;
        }
        const data = await response.json();
        setBookingLink(data.bookingLink);
      } catch (error) {
        console.error("Error fetching booking link:", error);
        setError("Failed to load booking link");
      }
    }

    fetchBookingLink();
  }, [slug]);

  // Fetch available slots when date changes
  useEffect(() => {
    const currentDate = selectedDate;

    if (!bookingLink || !currentDate || !slug) return;

    async function fetchAvailability(date: Date) {
      setIsLoading(true);
      try {
        // Format date as YYYY-MM-DD to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        
        const response = await fetch(
          `/api/availability/${slug}?date=${dateStr}`,
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Availability API error:", errorData);
          setAvailableSlots([]);
          return;
        }
        const data = await response.json();
        console.log(`Received ${data.availableSlots?.length || 0} slots for ${dateStr}`);
        setAvailableSlots(data.availableSlots || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailability(currentDate);
  }, [bookingLink, selectedDate, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !guestName || !guestEmail) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          guestName,
          guestEmail,
          guestNotes: guestNotes || undefined,
          startTime: selectedSlot.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create booking",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Booking Confirmed!</CardTitle>
            <CardDescription>
              You will receive a confirmation email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !bookingLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!bookingLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const disabledDates = [
    ...Array.from({ length: 30 }, (_, i) => addDays(new Date(), i)),
  ].filter((date) => date < new Date());

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 lg:flex-row">
        {/* Booking Info */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{bookingLink.title}</CardTitle>
              {bookingLink.description && (
                <CardDescription>{bookingLink.description}</CardDescription>
              )}
              <CardDescription>
                Duration: {bookingLink.duration} minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={bookingLink.hostImage ?? undefined}
                    alt={bookingLink.hostName || bookingLink.hostEmail}
                  />
                  <AvatarFallback>
                    {bookingLink.hostName
                      ? bookingLink.hostName.charAt(0).toUpperCase()
                      : bookingLink.hostEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {bookingLink.hostName || "Host"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingLink.hostEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calendar */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label className="mb-2 block">Available Times</Label>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading available slots...
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableSlots.map((slot) => {
                        const slotDate = new Date(slot);
                        const isSelected =
                          selectedSlot?.getTime() === slotDate.getTime();
                        return (
                          <Button
                            key={slot}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => setSelectedSlot(slotDate)}
                            className="text-sm"
                          >
                            {formatTime(slot)}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Guest Information Form */}
              {selectedSlot && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="guestName">Name *</Label>
                    <Input
                      id="guestName"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guestEmail">Email *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guestNotes">Additional Notes</Label>
                    <Textarea
                      id="guestNotes"
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

