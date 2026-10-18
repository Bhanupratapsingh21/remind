"use client";

import React from "react";
import { CalendarClock, CheckCircle2, PhoneCall, Volume2 } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

interface FeatureCardProps {
  number: string;
  category: string;
  title: string;
  description: string;
  icon: React.ElementType;
  onCardClick?: () => void;
}

function FeatureCard({ number, category, title, description, icon: Icon, onCardClick }: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onCardClick}
      className="group flex flex-col rounded-[22px] bg-white p-6 text-left transition-shadow hover:shadow-[0_12px_40px_-18px_rgba(120,80,30,.35)] sm:p-7"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          {number} / {category}
        </span>
      </div>

      <h3 className="mt-8 font-display text-2xl tracking-[-0.02em] text-zinc-950">{title}</h3>
      <p className="mt-2 font-serif text-[15px] leading-relaxed text-zinc-500">{description}</p>

      <span className="mt-auto flex items-center gap-1.5 pt-6 text-[12px] text-zinc-400 transition-colors group-hover:text-amber-600">
        <Volume2 className="h-3.5 w-3.5" /> Tap to hear it
      </span>
    </button>
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
    <section id="features" className="w-full scroll-mt-20 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-8 pb-12 md:flex-row md:items-end">
          <div>
            <Eyebrow>Real-time accountability</Eyebrow>
            <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
              For the commitments
              <br />
              you can&apos;t afford to drop.
            </h2>
          </div>

          <div className="space-y-1 font-serif text-[16px] leading-relaxed text-zinc-500">
            <p>Push alerts get swiped away.</p>
            <p>Alarms get snoozed into oblivion.</p>
            <p className="text-zinc-900">A direct voice call gets things done.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-1 gap-3 rounded-[28px] bg-tray p-3 md:grid-cols-3">
          <FeatureCard
            number="01"
            category="Direct call"
            icon={PhoneCall}
            title="Real voice calls."
            description="Your phone rings right when it matters. An AI agent delivers your task out loud with crisp human clarity."
            onCardClick={() => speakReminder("Hello, this is Remind calling for your scheduled task.")}
          />
          <FeatureCard
            number="02"
            category="Rescheduling"
            icon={CalendarClock}
            title="“Call me in 30 minutes.”"
            description="In a meeting or tied up? Simply tell the agent to try again later. Remind reschedules the call automatically."
            onCardClick={() => speakReminder("Understood. I will reschedule and call you back in 30 minutes.")}
          />
          <FeatureCard
            number="03"
            category="Resolution"
            icon={CheckCircle2}
            title="Say “Done” to complete."
            description="Once you finish the task, speak to confirm. Your dashboard immediately checks it off your list."
            onCardClick={() => speakReminder("Great job! Marked as completed on your dashboard.")}
          />
        </Reveal>

        <p className="mt-8 text-center text-[13px] text-zinc-400">
          Works on any phone number · Configurable quiet hours · Conversational AI
        </p>
      </div>
    </section>
  );
}
