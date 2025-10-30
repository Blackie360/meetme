import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/lib/landing-data";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section id="customers" className="space-y-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Loved by teams who live in their calendar
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Trusted by high-performing revenue, success, and talent teams.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="h-full border-border/60 bg-card/70 shadow-sm"
          >
            <CardContent className="flex h-full flex-col gap-6 pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="text-sm font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-foreground">
                “{testimonial.quote}”
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="lucide:bar-chart-3" className="size-4 text-primary" />
                {testimonial.metric}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
