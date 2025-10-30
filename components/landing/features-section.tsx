import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Feature } from "@/lib/landing-data";

type FeaturesSectionProps = {
  features: Feature[];
};

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="space-y-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Built for modern GTM teams
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you love about Calendly—plus intelligent automations.
        </h2>
        <p className="text-base text-muted-foreground">
          We started with the fundamentals you rely on and layered in AI,
          routing, and insights that keep revenue teams humming.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="h-full border-border/60 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/10"
          >
            <CardHeader className="gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="size-6" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl font-semibold">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {feature.bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                  <span>{bullet}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
