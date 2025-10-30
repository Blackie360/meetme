"use client";

import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

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

interface BlockedTime {
  id: string;
  startTime: Date;
  endTime: Date;
  title: string | null;
}

interface BlockedTimesManagerProps {
  bookingLinkId: string;
}

export function BlockedTimesManager({
  bookingLinkId,
}: BlockedTimesManagerProps) {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    async function fetchBlockedTimes() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/blocked-times?bookingLinkId=${bookingLinkId}`,
        );
        if (response.ok) {
          const data: {
            blockedTimes: Array<
              Omit<BlockedTime, "startTime" | "endTime"> & {
                startTime: string;
                endTime: string;
              }
            >;
          } = await response.json();

          setBlockedTimes(
            data.blockedTimes.map((bt) => ({
              ...bt,
              startTime: new Date(bt.startTime),
              endTime: new Date(bt.endTime),
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching blocked times:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlockedTimes();
  }, [bookingLinkId]);

  const handleAdd = async () => {
    if (!newStartTime || !newEndTime) {
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/blocked-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingLinkId,
          startTime: newStartTime,
          endTime: newEndTime,
          title: newTitle || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedTimes([
          ...blockedTimes,
          {
            ...data.blockedTime,
            startTime: new Date(data.blockedTime.startTime),
            endTime: new Date(data.blockedTime.endTime),
          },
        ]);
        setNewStartTime("");
        setNewEndTime("");
        setNewTitle("");
      }
    } catch (error) {
      console.error("Error adding blocked time:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/blocked-times?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlockedTimes(blockedTimes.filter((bt) => bt.id !== id));
      }
    } catch (error) {
      console.error("Error deleting blocked time:", error);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Times</CardTitle>
        <CardDescription>
          Block specific dates or times when you're not available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Vacation"
            className="mt-1"
          />
        </div>
        <Button onClick={handleAdd} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add Blocked Time"}
        </Button>

        {blockedTimes.length > 0 && (
          <div className="space-y-2">
            <Label>Blocked Periods</Label>
            {blockedTimes.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {block.title || "Blocked Time"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(block.startTime, "PPP 'at' p")} -{" "}
                    {format(block.endTime, "PPP 'at' p")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(block.id)}
                >
                  <Icon icon="lucide:x" className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

