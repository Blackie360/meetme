"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: "OAuth callback error. Please check your Google OAuth configuration and ensure the callback URL matches your Google Cloud Console settings.",
  Configuration: "Authentication configuration error. Please check your environment variables.",
  AccessDenied: "Access denied. Please grant the required permissions.",
  Verification: "Email verification error. Please try again.",
  Default: "An authentication error occurred. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read error from URL query parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessage = ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default;
      setError(errorMessage);
      // Clean up the URL by removing the error parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      newUrl.searchParams.delete("callbackUrl");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (response?.error) {
        setIsLoading(false);
        setError(response.error);
        return;
      }

      if (response?.url) {
        router.push(response.url);
        return;
      }
    } catch (cause) {
      setIsLoading(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong while starting the Google sign-in flow.",
      );
      return;
    }

    // If we reach this point without redirecting, stop the loading state.
    setIsLoading(false);
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
            {isLoading ? (
              <>
                <Icon icon="lucide:loader-2" className="size-5 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <Icon icon="devicon:google" className="size-5" />
                Continue with Google
              </>
            )}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
          <Card className="w-full max-w-md border-border/60">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">Sign in to MeetMe</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Use your Google account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button disabled size="lg">
                Loading...
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
