"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EyeAvatar, EyeEmotion } from "@/components/EyeAvatar";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { DailyCareSection } from "@/components/DailyCareSection";
import { LanguageAvatarShowcase } from "@/components/LanguageAvatarShowcase";
import { QuietHoursSection } from "@/components/QuietHoursSection";
import { HowItWorks } from "@/components/HowItWorks";

export default function LandingPage() {
  const [topEmotion, setTopEmotion] = useState<EyeEmotion>("neutral");

  // Cycle emotions on click for delightful interactive play
  const emotionsList: EyeEmotion[] = ["neutral", "happy", "caring", "wink", "excited", "sleepy", "focused"];
  const handleTopAvatarClick = () => {
    setTopEmotion((prev) => {
      const nextIdx = (emotionsList.indexOf(prev) + 1) % emotionsList.length;
      return emotionsList[nextIdx];
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#151515] font-sans selection:bg-neutral-200 antialiased">
      {/* HEADER / NAVIGATION */}
      <header className="w-full bg-white/90 backdrop-blur-xs sticky top-0 z-50">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-bold tracking-tighter text-[#151515] hover:opacity-80 transition-opacity"
          >
            remind
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-600 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-neutral-300/80 bg-white px-5 py-1.5 text-xs font-medium text-[#151515] hover:bg-neutral-50 hover:border-neutral-400 transition-all cursor-pointer shadow-xs"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="w-full">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-16 sm:pt-24 sm:pb-24 text-center">
          {/* Top Eye Avatar placed at the position of AI PHONE CALL REMINDERS */}
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <div
              onClick={handleTopAvatarClick}
              className="group cursor-pointer flex flex-col items-center"
              title="Click to cycle emotions!"
            >
              <EyeAvatar size={62} emotion={topEmotion} />
              <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5">
                {topEmotion}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mt-4 text-[40px] sm:text-[54px] md:text-[64px] font-normal text-[#151515] tracking-tight leading-[1.15] md:leading-[74px]">
            A reminder you can’t simply swipe away.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-neutral-500 font-normal max-w-2xl mx-auto leading-relaxed">
            Schedule a task on your dashboard. When the moment arrives, an AI voice agent calls your phone, delivers your reminder, and reschedules or marks it done by voice.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
            {/* Start Free Button */}
            <div className="flex flex-col items-center">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#18181b] px-6 text-xs sm:text-sm font-medium text-white transition-all hover:bg-black active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Get Started Free
              </Link>
              <span className="mt-2 font-mono text-[11px] text-neutral-400">
                Create your first reminder in 60s
              </span>
            </div>

            {/* Dashboard / Live Demo Button */}
            <div className="flex flex-col items-center">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 text-xs sm:text-sm font-medium text-[#151515] transition-all hover:bg-neutral-50 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Open Dashboard
              </Link>
              <span className="mt-2 font-mono text-[11px] text-neutral-400">
                Manage your calls & schedule
              </span>
            </div>
          </div>

          {/* Interactive Audio Player Bar */}
          <div className="mt-20 sm:mt-28 flex justify-center">
            <AudioPlayerBar />
          </div>
        </section>

        {/* Hairline Divider */}
        <div className="w-full border-b border-neutral-200/80" />

        {/* SECTION 2: REAL-TIME ACCOUNTABILITY */}
        <DailyCareSection />

        {/* SECTION 3: VOICE & PERSONA CUSTOMIZATION */}
        <LanguageAvatarShowcase />

        {/* SECTION 4: CALL PREFERENCES & CONTROL */}
        <QuietHoursSection />

        {/* SECTION 5: HOW IT WORKS (CLEAN WORKFLOW, ZERO PRICING) */}
        <HowItWorks />
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
