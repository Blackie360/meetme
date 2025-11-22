"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotFoundProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  homeHref?: string;
  homeLabel?: string;
}

export function NotFound({
  title = "404 - Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  homeHref = "/",
  homeLabel = "Go back home",
}: NotFoundProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
            <Icon icon="lucide:file-question" className="size-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showHomeButton && (
            <Button asChild size="lg" className="w-full">
              <Link href={homeHref}>
                <Icon icon="lucide:home" className="mr-2 size-4" />
                {homeLabel}
              </Link>
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon icon="lucide:arrow-left" className="size-4" />
            <button
              type="button"
              onClick={() => window.history.back()}
              className="hover:text-foreground transition-colors"
            >
              Go back
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

