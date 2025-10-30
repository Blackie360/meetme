import { Icon } from "@iconify/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Workflow } from "@/lib/landing-data";

type WorkflowsSectionProps = {
  workflows: Workflow[];
};

export function WorkflowsSection({ workflows }: WorkflowsSectionProps) {
  return (
    <section id="workflows" className="space-y-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          Workflow templates
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready-to-launch experiences for every team.
        </h2>
        <p className="text-base text-muted-foreground">
          Choose a template, connect your tools, and go live in minutes. Each
          workflow comes with automations, reminder logic, and dashboards built
          in.
        </p>
      </div>
      <Tabs defaultValue={workflows[0]?.value ?? ""} className="w-full">
        <TabsList className="mx-auto flex w-full max-w-full gap-2 overflow-x-auto px-1 md:w-fit md:flex-wrap md:justify-center">
          {workflows.map((workflow) => (
            <TabsTrigger
              key={workflow.value}
              value={workflow.value}
              className="flex-none"
            >
              {workflow.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {workflows.map((workflow) => (
          <TabsContent
            key={workflow.value}
            value={workflow.value}
            className="mt-8"
          >
            <Card className="border-primary/15 bg-card/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="border-primary/40 text-primary"
                  >
                    {workflow.metric.value} {workflow.metric.caption}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold">
                    {workflow.heading}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {workflow.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {workflow.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2">
                    <Icon icon="lucide:check-circle-2" className="mt-0.5 size-4 text-primary" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Launch with smart routing, branded emails, and analytics—no
                  extra configuration required.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="#get-started">Preview workflow</Link>
                  </Button>
                  <Button asChild>
                    <Link href="#get-started">Use this template</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
