"use client";

import { HomeHero } from "@/components/HomeHero";
import { DailyCareSection } from "@/components/DailyCareSection";
import { LanguageAvatarShowcase } from "@/components/LanguageAvatarShowcase";
import { QuietHoursSection } from "@/components/QuietHoursSection";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSection } from "@/components/PricingSection";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased selection:bg-amber-100">
      {/* HEADER + HERO (cloud sky + AI agent) */}
      <HomeHero />

      <main className="w-full">
        {/* REAL-TIME ACCOUNTABILITY */}
        <DailyCareSection />

        {/* VOICE & PERSONA CUSTOMIZATION */}
        <LanguageAvatarShowcase />

        {/* CALL PREFERENCES & CONTROL */}
        <QuietHoursSection />

        {/* HOW IT WORKS */}
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </div>

        {/* PRICING */}
        <PricingSection />
      </main>

      <SiteFooter />
    </div>
  );
}
