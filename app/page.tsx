import { redirect } from "next/navigation";

import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { GrainOverlay } from "@/components/landing/grain-overlay";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/header";
import { WorkflowsSection } from "@/components/landing/workflows-section";
import { getServerAuthSession } from "@/lib/auth";
import {
  defaultSelectedDate,
  faqs,
  features,
  heroSlots,
  heroStats,
  navLinks,
  workflows,
} from "@/lib/landing-data";

export default async function Home() {
  const session = await getServerAuthSession();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />
      <div className="relative z-10">
        <LandingHeader navLinks={navLinks} />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-4 pb-24 pt-16 sm:px-6 md:px-10">
          <HeroSection
            stats={heroStats}
            slots={heroSlots}
            date={defaultSelectedDate}
          />
          <FeaturesSection features={features} />
          <WorkflowsSection workflows={workflows} />
          <FaqSection faqs={faqs} />
          <CtaSection />
        </main>
      </div>
    </div>
  );
}
