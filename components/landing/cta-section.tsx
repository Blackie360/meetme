import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export function CtaSection() {
  return (
    <section id="get-started">
      <Card className="relative overflow-hidden border-primary/30 bg-primary text-primary-foreground shadow-xl">
        <CardContent className="flex flex-col gap-6 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="bg-primary-foreground/15 text-primary-foreground"
            >
              14-day free trial · cancel anytime
            </Badge>
            <CardTitle className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Launch your next meeting link in under five minutes.
            </CardTitle>
            <CardDescription className="max-w-xl text-primary-foreground/80 text-base">
              Connect your calendars, invite your team, and let MeetMe handle
              the rest. No credit card required.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/login">Create your link</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-primary-foreground/50 bg-primary/25 text-primary-foreground hover:bg-primary/35 hover:text-primary-foreground"
            >
              <Link href="/book/ij5cn-3rvw">Talk to sales</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
