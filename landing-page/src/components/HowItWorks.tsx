"use client";

import React from "react";
import { CalendarPlus, Mic, PhoneIncoming } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

const STEPS = [
  {
    icon: CalendarPlus,
    title: "Create your reminder.",
    text: "Schedule your task and time directly on the web dashboard.",
  },
  {
    icon: PhoneIncoming,
    title: "Pick up the phone.",
    text: "At the exact minute, Remind calls you and speaks your task out loud.",
  },
  {
    icon: Mic,
    title: "Speak to update or snooze.",
    text: "Tell the agent you did it, or ask it to call back in 30 minutes.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full px-4 pb-24 pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl text-center">
        <Reveal>
        <div className="flex justify-center">
          <Eyebrow>Simple 3-step flow</Eyebrow>
        </div>
        <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
          Set it once.
          <br />
          Remind handles the call.
        </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-3 rounded-[28px] bg-tray p-3 text-left md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1} className="rounded-[22px] bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-950 font-mono text-[12px] text-amber-200">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-zinc-950">{title}</h3>
              <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-zinc-500">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
