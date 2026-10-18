"use client";

import { HomeHero } from "@/components/HomeHero";
import { DailyCareSection } from "@/components/DailyCareSection";
import { LanguageAvatarShowcase } from "@/components/LanguageAvatarShowcase";
import { QuietHoursSection } from "@/components/QuietHoursSection";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSection } from "@/components/PricingSection";
import { MobileAppSection } from "@/components/MobileAppSection";
import { ScrollMascot } from "@/components/ScrollMascot";
import { MascotSpot } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased selection:bg-amber-100">
      {/* HEADER + HERO (cloud sky + AI agent) */}
      <HomeHero />

      {/* the agent flies between sections while you scroll (desktop) */}
      <ScrollMascot />

      <main className="w-full">
        {/* REAL-TIME ACCOUNTABILITY */}
        <MascotSpot say="Tap a card, I'll say it out loud." side="right">
          <DailyCareSection />
        </MascotSpot>

        {/* VOICE & PERSONA CUSTOMIZATION */}
        <MascotSpot say="Pick the voice you want to hear from." side="left">
          <LanguageAvatarShowcase />
        </MascotSpot>

        {/* CALL PREFERENCES & CONTROL */}
        <MascotSpot say="I never call while you sleep." side="right">
          <QuietHoursSection />
        </MascotSpot>

        {/* HOW IT WORKS */}
        <MascotSpot id="how-it-works" className="scroll-mt-20" say="Three steps. That's the whole thing." side="right">
          <HowItWorks />
        </MascotSpot>

        {/* PRICING */}
        <MascotSpot say="Start free. Upgrade when you want me to listen back." side="left">
          <PricingSection />
        </MascotSpot>

        {/* MOBILE APP */}
        <MascotSpot say="And soon, I'm in your pocket too." side="right">
          <MobileAppSection />
        </MascotSpot>
      </main>

      <SiteFooter />
    </div>
  );
}
