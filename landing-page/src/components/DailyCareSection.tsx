"use client";

import React from "react";

interface FeatureCardProps {
  number: string;
  category: string;
  title: string;
  description: string;
  onCardClick?: () => void;
}

function FeatureCard({
  number,
  category,
  title,
  description,
  onCardClick,
}: FeatureCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="group flex flex-col pt-6 relative cursor-pointer select-none"
    >
      {/* Top line with dot indicator */}
      <div className="flex items-center gap-2 mb-8">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 shrink-0" />
        <span className="h-[1px] w-full bg-neutral-200" />
      </div>

      {/* Kicker */}
      <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
        {number} / {category}
      </p>

      {/* Title */}
      <h3 className="mt-8 text-xl sm:text-2xl font-normal text-[#151515] tracking-tight group-hover:text-black transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function DailyCareSection() {
  const speakReminder = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="w-full bg-white py-24 sm:py-32 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
          {/* Left Title */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              REAL-TIME ACCOUNTABILITY
            </p>
            <h2 className="mt-4 text-4xl sm:text-5xl font-normal text-[#151515] tracking-tight leading-[1.12]">
              For the commitments
              <br />
              you can't afford to drop.
            </h2>
          </div>

          {/* Right Poetic Subtext */}
          <div className="text-xs sm:text-sm text-neutral-500 space-y-1.5 font-normal md:text-left leading-relaxed">
            <p>Push alerts get swiped away.</p>
            <p>Alarms get snoozed into oblivion.</p>
            <p>A direct voice call gets things done.</p>
          </div>
        </div>

        {/* 3 Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <FeatureCard
            number="01"
            category="DIRECT PHONE CALL"
            title="Real voice calls."
            description="Your phone rings right when it matters. An AI agent delivers your task out loud with crisp human clarity."
            onCardClick={() =>
              speakReminder("Hello, this is Remind calling for your scheduled task.")
            }
          />

          <FeatureCard
            number="02"
            category="SMART RESCHEDULING"
            title="“Call me in 30 minutes.”"
            description="In a meeting or tied up? Simply tell the agent to try again later. Remind reschedules the call automatically."
            onCardClick={() =>
              speakReminder("Understood. I will reschedule and call you back in 30 minutes.")
            }
          />

          <FeatureCard
            number="03"
            category="LIVE RESOLUTION"
            title="Say “Done” to complete."
            description="Once you finish the task, speak to confirm. Your dashboard immediately checks it off your list."
            onCardClick={() =>
              speakReminder("Great job! Marked as completed on your dashboard.")
            }
          />
        </div>

        {/* Footnote */}
        <p className="mt-16 text-xs text-neutral-400 font-normal">
          Works on any phone number worldwide · Configurable quiet hours · Dynamic conversational AI
        </p>
      </div>
    </section>
  );
}
