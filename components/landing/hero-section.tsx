import { MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HeroStat } from "@/lib/landing-data";
import { heroCta } from "@/lib/landing-data";

type HeroSectionProps = {
  stats: HeroStat[];
  slots: string[];
  date: Date;
};

export function HeroSection({ stats, slots, date }: HeroSectionProps) {
  const PrimaryIcon = heroCta.primary.icon;

  return (
    <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
      <div className="space-y-10">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
            Your AI scheduling copilot
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Scheduling that feels personal, at scale.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            MeetMe is the fastest way to turn interest into confirmed meetings.
            Share a single link that adapts to every guest, automates the
            busywork, and keeps your team focused on the conversations that move
            revenue.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" asChild>
            <Link
              href={heroCta.primary.href}
              className="flex items-center gap-2"
            >
              {heroCta.primary.label}
              <PrimaryIcon className="size-4" />
            </Link>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg">
                {heroCta.secondary.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Grab a 15-minute walkthrough with our product team.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm sm:flex-row sm:items-center">
          {stats.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 ? (
                <Separator
                  orientation="vertical"
                  className="hidden h-14 sm:block"
                />
              ) : null}
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <Card className="border-primary/20 bg-card/80 shadow-lg shadow-primary/10 backdrop-blur">
        <CardHeader className="gap-4 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src="/globe.svg" alt="Guest avatar" />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Maya Chen
                </CardTitle>
                <CardDescription>
                  Revenue lead · 30 min discovery
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">Auto-routing</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Calendar
            mode="single"
            selected={date}
            className="rounded-xl border border-border/60"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <Button key={slot} variant="outline" className="justify-center">
                {slot}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t border-border/60 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>Timezone detection and buffers applied automatically</span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <MessageSquare className="size-4" />
                  Personalized confirmation email
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Agenda, prep notes, and reminders included.
              </TooltipContent>
            </Tooltip>
            <Button className="ml-auto">
              Confirm meeting
              <PrimaryIcon className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
