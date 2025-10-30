"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilitySettingsProps {
  bookingLinkId: string;
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

export function AvailabilitySettings({ bookingLinkId }: AvailabilitySettingsProps) {
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/availability-settings/${bookingLinkId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setStartHour(data.settings.startHour ?? 9);
            setEndHour(data.settings.endHour ?? 17);
            setDaysOfWeek(data.settings.daysOfWeek ?? [1, 2, 3, 4, 5]);
          }
        }
      } catch (error) {
        console.error("Error fetching availability settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [bookingLinkId]);

  const handleDayToggle = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/availability-settings/${bookingLinkId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startHour,
            endHour,
            daysOfWeek,
          }),
        },
      );

      if (response.ok) {
        // Success feedback could be added here
      }
    } catch (error) {
      console.error("Error saving availability settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          Set when you're available for bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startHour">Start Hour</Label>
            <Input
              id="startHour"
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endHour">End Hour</Label>
            <Input
              id="endHour"
              type="number"
              min="0"
              max="23"
              value={endHour}
              onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Available Days</Label>
          <div className="mt-2 space-y-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={daysOfWeek.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label
                  htmlFor={`day-${day.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

