"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch (cause) {
      setIsLoading(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong while starting the Google sign-in flow.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Sign in to MeetMe</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Use your Google account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleSignIn} disabled={isLoading} size="lg">
            {isLoading ? "Redirecting…" : "Continue with Google"}
          </Button>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
