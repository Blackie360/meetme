import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Faq } from "@/lib/landing-data";

type FaqSectionProps = {
  faqs: Faq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section id="faq" className="space-y-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          FAQ
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to know before you launch.
        </h2>
      </div>
      <Card className="border-border/60 bg-card/70">
        <CardContent className="px-0">
          <Accordion
            type="single"
            collapsible
            className="divide-y divide-border/60"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`faq-${index}`}
                className="px-6"
              >
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
