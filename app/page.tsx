import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WorkflowsSection } from "@/components/landing/workflows-section";
import {
  defaultSelectedDate,
  faqs,
  features,
  heroSlots,
  heroStats,
  navLinks,
  testimonials,
  workflows,
} from "@/lib/landing-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader navLinks={navLinks} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-4 pb-24 pt-16 sm:px-6 md:px-10">
        <HeroSection
          stats={heroStats}
          slots={heroSlots}
          date={defaultSelectedDate}
        />
        <FeaturesSection features={features} />
        <WorkflowsSection workflows={workflows} />
        <TestimonialsSection testimonials={testimonials} />
        <FaqSection faqs={faqs} />
        <CtaSection />
      </main>
    </div>
  );
}
