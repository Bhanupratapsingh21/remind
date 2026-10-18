"use client";

import Link from "next/link";
import { HomeHero } from "@/components/HomeHero";
import { DailyCareSection } from "@/components/DailyCareSection";
import { LanguageAvatarShowcase } from "@/components/LanguageAvatarShowcase";
import { QuietHoursSection } from "@/components/QuietHoursSection";
import { HowItWorks } from "@/components/HowItWorks";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#151515] font-sans selection:bg-neutral-200 antialiased">
      {/* HEADER + HERO (cloud sky + AI agent) */}
      <HomeHero />

      <main className="w-full">
        {/* SECTION 2: REAL-TIME ACCOUNTABILITY */}
        <DailyCareSection />

        {/* SECTION 3: VOICE & PERSONA CUSTOMIZATION */}
        <LanguageAvatarShowcase />

        {/* SECTION 4: CALL PREFERENCES & CONTROL */}
        <QuietHoursSection />

        {/* SECTION 5: HOW IT WORKS (CLEAN WORKFLOW, ZERO PRICING) */}
        <div id="how-it-works">
          <HowItWorks />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-neutral-200/70 bg-white py-12 px-6">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400 font-normal">
          <p>
            © {new Date().getFullYear()} Remind. Created & Developed by{" "}
            <a
              href="https://bpss.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 underline underline-offset-2 hover:text-black transition-colors"
            >
              bpss.in
            </a>{" "}
            &{" "}
            <a
              href="https://www.rambhardwaj.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 underline underline-offset-2 hover:text-black transition-colors"
            >
              rambhardwaj.in
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-neutral-800 transition">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-neutral-800 transition">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-neutral-800 transition">
              Sign Up
            </Link>
            <a href="#" className="hover:text-neutral-800 transition">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
